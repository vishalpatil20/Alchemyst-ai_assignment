# Alchemyst AI Assignment - Distributed Microservice Deployment

This repository contains the Terraform infrastructure code and deployment scripts to run the distributed quickstart system across Google Cloud (GCP) Virtual Machines in a Virtual Private Cloud (VPC).

---

## System Architecture

The following diagram shows the network setup and deployment flow:

![System Design Architecture Diagram](architecture_diagram.png)



### Network Design
- **Private Worker VMs**: The worker VMs only have private IPs.
- **NAT Gateway**: The private subnet uses Cloud NAT to download dependencies (npm and pip packages) without exposing open ports to the internet.
- **SSH ProxyJump**: Code is deployed to the private VMs by using the public gateway VM as an SSH proxy host.

---

## Interactive Web Playground

The TypeScript worker serves a web playground at the root path:

[http://35.239.123.59:3111/](http://35.239.123.59:3111/)

Routing flow:
1. The gateway VM receives the `GET /` request.
2. The gateway forwards the request over WebSocket-RPC to the TypeScript worker.
3. The TypeScript worker serves a web interface.
4. Users can input ideas and select buzzwords to get a mock VC valuation and pitch.
5. The frontend calls the `/startup/pitch` POST endpoint and displays the response.

### Valuation Terminal UI Snapshot

Below is a snapshot of the clean, minimal financial terminal dashboard interface served by the worker:

<img width="1914" height="896" alt="image" src="https://github.com/user-attachments/assets/be96b082-521a-4a14-8a0a-21c9c99ef8b8" />


---

## Live Verification

You can test the startup pitch endpoint using a curl command or by opening the web playground in a browser.

### Exact Curl Request
```bash
curl -X POST http://35.239.123.59:3111/startup/pitch \
  -H 'Content-Type: application/json' \
  -d '{"idea": "A simple list app", "buzzwords": ["AI", "blockchain", "agentic"]}'
```

### Sample Response
```json
{
  "idea": "A simple list app",
  "buzzwords_detected": [
    "AI",
    "blockchain",
    "agentic"
  ],
  "satirical_pitch": "We are leveraging an autonomous multi-agent synergy framework and decentralized ledger security layer to systematically disrupt the traditional A simple list app landscape at infinite scale.",
  "estimated_valuation_usd": 84375000,
  "global_vc_capital_burned_usd": 84375000,
  "success": "VC funding round successfully closed! The board approves of your paradigm shift.",
  "interoperability_note": "Success! This payload was processed by a TypeScript worker, routed over the private VPC subnet via RPC, analyzed by a Python worker, saved to a central state DB, and returned back seamlessly."
}
```
*(Running this command increments the `global_vc_capital_burned_usd` counter stored on the central VM).*

---

## Deployment Script Optimizations

The `deploy.sh` script includes these improvements:
1. **Source Archiving**: Packs the codebase into a `quickstart.tar.gz` archive before transfer.
2. **Excluding Unnecessary Files**: Excludes local `node_modules`, `.venv`, `.next`, `.git`, databases, and lock files, reducing payload size.
3. **Clean Extraction**: Unpacks the code into `/home/vishal/` after clearing out older files, preventing file drift.

---

## Deployment Steps

To provision and run this setup on Google Cloud:

### 1. Prerequisites and Auth
Install gcloud and terraform CLI tools.

```bash
gcloud auth login
gcloud auth application-default login
gcloud services enable compute.googleapis.com
```

### 2. Generate SSH Key
Generate a key pair for automated deployment scripts:
```bash
ssh-keygen -t ed25519 -f ~/.ssh/id_gcp -N ""
```

### 3. Configure Terraform Variables
Update the values in [infrastructure/environments/dev/terraform.tfvars](file:///home/vishal/Assignment/Alchemyst-ai_assignment/infrastructure/environments/dev/terraform.tfvars):
```hcl
project_id     = "YOUR_GCP_PROJECT_ID"
ssh_user       = "vishal"
ssh_public_key = "ssh-ed25519 AAAAC3... [content of ~/.ssh/id_gcp.pub] ..."
```

### 4. Apply Terraform
Provision the VMs and VPC:
```bash
cd infrastructure/environments/dev
terraform init
terraform apply -auto-approve
```

### 5. Run Deploy Script
From the repository root, run the deployment script:
```bash
cd ../../..
chmod +x scripts/deploy.sh
./scripts/deploy.sh
```

### 6. Verify
Run the curl command with the output gateway public IP.

---

## Engineering Writeup: Production Hardening and Scale

### Part 1: Production Hardening Checklist
To prepare this setup for production:
1. **Least-Privilege Service Accounts**: Assign minimal IAM roles to VMs instead of the default compute service account.
2. **Remote State Backend**: Migrate the local Terraform state to a Google Cloud Storage bucket with object versioning and state locking enabled.
3. **Firewall Access Controls**: Limit SSH ingress to trusted IP ranges (e.g., VPN) instead of opening it to the public.
4. **HTTPS Encryption**: Put the gateway VM behind a load balancer with SSL certificates, or use Nginx on the gateway for SSL termination.
5. **Monitoring**: Configure logging (e.g., Cloud Logging) and set up basic uptime checks on the API endpoints.

### Part 2: Architecture for a 100x Larger Model (GPU Serving)
If the model size increases by 100x:
1. **Containerized Orchestration (GKE)**: Use Google Kubernetes Engine with GPU-enabled node pools to handle resource management and scaling.
2. **Dedicated Serving Framework (vLLM / Triton)**: Serve the model using vLLM or Triton Inference Server to optimize memory usage (via KV-caching and quantization) and throughput (via request batching).
3. **Message Queue**: Place a message queue (like RabbitMQ or Kafka) in front of workers to buffer spikes in user traffic and prevent request timeouts.
4. **Autoscaling**: Scale the GPU nodes automatically based on queue length or metrics.
