#!/bin/bash
set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo -e "${GREEN}==> Phase 2: Starting Automated Deployment...${NC}"

# Resolve directories robustly
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
DEV_ENV_DIR="$REPO_ROOT/infrastructure/environments/dev"

# Navigate to terraform directory
cd "$DEV_ENV_DIR"

echo -e "${YELLOW}==> Fetching IP addresses from Terraform outputs...${NC}"
ENGINE_PUBLIC_IP=$(terraform output -raw engine_public_ip 2>/dev/null || echo "")
ENGINE_PRIVATE_IP=$(terraform output -raw engine_private_ip 2>/dev/null || echo "")
CALLER_PRIVATE_IP=$(terraform output -raw caller_private_ip 2>/dev/null || echo "")
INFERENCE_PRIVATE_IP=$(terraform output -raw inference_private_ip 2>/dev/null || echo "")

if [ -z "$ENGINE_PUBLIC_IP" ] || [ -z "$ENGINE_PRIVATE_IP" ] || [ -z "$CALLER_PRIVATE_IP" ] || [ -z "$INFERENCE_PRIVATE_IP" ]; then
    echo -e "${RED}Error: Could not retrieve all IP addresses. Have you run 'terraform apply'?${NC}"
    exit 1
fi

echo -e "${GREEN}IP Addresses Fetched:${NC}"
echo -e "  - Engine Public:    ${GREEN}${ENGINE_PUBLIC_IP}${NC}"
echo -e "  - Engine Private:   ${GREEN}${ENGINE_PRIVATE_IP}${NC}"
echo -e "  - Caller Private:   ${GREEN}${CALLER_PRIVATE_IP}${NC}"
echo -e "  - Inference Private: ${GREEN}${INFERENCE_PRIVATE_IP}${NC}"

# Navigate back to repository root
cd "$REPO_ROOT"

# Temporary directory for customized systemd units
TMP_DIR=$(mktemp -d)
trap 'rm -rf "$TMP_DIR"' EXIT

# Customize systemd files with actual Engine Private IP
echo -e "${YELLOW}==> Preparing customized systemd unit files...${NC}"
cp workers/systemd/engine.service "$TMP_DIR/engine.service"

cp workers/systemd/caller.service "$TMP_DIR/caller.service"
sed -i "s/ENGINE_PRIVATE_IP/$ENGINE_PRIVATE_IP/g" "$TMP_DIR/caller.service"

cp workers/systemd/inference.service "$TMP_DIR/inference.service"
sed -i "s/ENGINE_PRIVATE_IP/$ENGINE_PRIVATE_IP/g" "$TMP_DIR/inference.service"

# Determine SSH key to use (fallback to id_ed25519 if no id_gcp is found)
SSH_KEY="$HOME/.ssh/id_ed25519"
if [ -f "$HOME/.ssh/id_gcp" ]; then
    SSH_KEY="$HOME/.ssh/id_gcp"
fi

# SSH / SCP configuration for private subnets using Gateway as Bastion Jump Host
SSH_GATEWAY_ARGS="-i $SSH_KEY -o IdentitiesOnly=yes -o StrictHostKeyChecking=no"
SSH_JUMP_ARGS="-i $SSH_KEY -o IdentitiesOnly=yes -o ProxyJump=vishal@$ENGINE_PUBLIC_IP -o StrictHostKeyChecking=no"

# ----------------------------------------------------
# PREPARE TAR ARCHIVE (excluding local node_modules, .venv, .next, and runtime cache files)
# ----------------------------------------------------
echo -e "${YELLOW}==> Packing codebase...${NC}"
tar -czf "$TMP_DIR/quickstart.tar.gz" \
    --exclude="node_modules" \
    --exclude=".venv" \
    --exclude=".next" \
    --exclude=".git" \
    --exclude="data" \
    --exclude="*.db" \
    --exclude="*.lock" \
    quickstart/

# ----------------------------------------------------
# 1. DEPLOY ENGINE VM
# ----------------------------------------------------
echo -e "${YELLOW}==> Deploying to Engine VM (${ENGINE_PUBLIC_IP})...${NC}"
# Transfer and extract codebase
scp $SSH_GATEWAY_ARGS "$TMP_DIR/quickstart.tar.gz" vishal@$ENGINE_PUBLIC_IP:/tmp/quickstart.tar.gz
ssh $SSH_GATEWAY_ARGS vishal@$ENGINE_PUBLIC_IP "
    rm -rf /home/vishal/quickstart
    tar -xzf /tmp/quickstart.tar.gz -C /home/vishal/
    rm -f /tmp/quickstart.tar.gz
"

# Copy systemd unit
scp $SSH_GATEWAY_ARGS "$TMP_DIR/engine.service" vishal@$ENGINE_PUBLIC_IP:/tmp/engine.service

# Setup and start service
ssh $SSH_GATEWAY_ARGS vishal@$ENGINE_PUBLIC_IP "
    sudo mv /tmp/engine.service /etc/systemd/system/engine.service
    sudo systemctl daemon-reload
    sudo systemctl enable engine
    sudo systemctl restart engine
    echo 'Engine service started successfully!'
"

# ----------------------------------------------------
# 2. DEPLOY TS CALLER WORKER VM
# ----------------------------------------------------
echo -e "${YELLOW}==> Deploying to TS Caller Worker VM (${CALLER_PRIVATE_IP})...${NC}"
# Transfer and extract codebase
scp $SSH_JUMP_ARGS "$TMP_DIR/quickstart.tar.gz" vishal@$CALLER_PRIVATE_IP:/tmp/quickstart.tar.gz
ssh $SSH_JUMP_ARGS vishal@$CALLER_PRIVATE_IP "
    rm -rf /home/vishal/quickstart
    tar -xzf /tmp/quickstart.tar.gz -C /home/vishal/
    rm -f /tmp/quickstart.tar.gz
"

# Copy systemd unit
scp $SSH_JUMP_ARGS "$TMP_DIR/caller.service" vishal@$CALLER_PRIVATE_IP:/tmp/caller.service

# Build and start service
ssh $SSH_JUMP_ARGS vishal@$CALLER_PRIVATE_IP "
    echo 'Installing npm dependencies (this may take a minute)...'
    cd /home/vishal/quickstart/workers/caller-worker
    npm install
    
    sudo mv /tmp/caller.service /etc/systemd/system/caller.service
    sudo systemctl daemon-reload
    sudo systemctl enable caller
    sudo systemctl restart caller
    echo 'Caller service started successfully!'
"

# ----------------------------------------------------
# 3. DEPLOY PYTHON INFERENCE WORKER VM
# ----------------------------------------------------
echo -e "${YELLOW}==> Deploying to Python Inference VM (${INFERENCE_PRIVATE_IP})...${NC}"
# Transfer and extract codebase
scp $SSH_JUMP_ARGS "$TMP_DIR/quickstart.tar.gz" vishal@$INFERENCE_PRIVATE_IP:/tmp/quickstart.tar.gz
ssh $SSH_JUMP_ARGS vishal@$INFERENCE_PRIVATE_IP "
    rm -rf /home/vishal/quickstart
    tar -xzf /tmp/quickstart.tar.gz -C /home/vishal/
    rm -f /tmp/quickstart.tar.gz
"

# Copy systemd unit
scp $SSH_JUMP_ARGS "$TMP_DIR/inference.service" vishal@$INFERENCE_PRIVATE_IP:/tmp/inference.service

# Setup virtual environment, install requirements and start service
ssh $SSH_JUMP_ARGS vishal@$INFERENCE_PRIVATE_IP "
    echo 'Setting up Python Virtual Environment & installing dependencies...'
    cd /home/vishal/quickstart/workers/math-worker
    python3 -m venv .venv
    .venv/bin/pip install --upgrade pip
    .venv/bin/pip install -r requirements.txt
    
    sudo mv /tmp/inference.service /etc/systemd/system/inference.service
    sudo systemctl daemon-reload
    sudo systemctl enable inference
    sudo systemctl restart inference
    echo 'Inference service started successfully!'
"

echo -e "${GREEN}==> Deployment Complete!${NC}"
echo -e "${YELLOW}==> Verification Curl Command:${NC}"
echo -e "    curl -X POST http://${ENGINE_PUBLIC_IP}:3111/startup/pitch \\"
echo -e "      -H 'Content-Type: application/json' \\"
echo -e "      -d '{\"idea\": \"A simple list app\", \"buzzwords\": [\"AI\", \"blockchain\", \"agentic\"]}'"
