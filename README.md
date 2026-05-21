# Alchemyst AI Assignment — Distributed Microservice Deployment

This repository contains the complete production-ready **Infrastructure-as-Code (IaC)** and **automated deployment orchestration** to provision, secure, and run the distributed `quickstart` system across multiple Google Cloud (GCP) Virtual Machines inside a secure Virtual Private Cloud (VPC).

---

## 🏗️ System Architecture

The following diagram illustrates the network hygiene, VM provisioning, and WebSocket-RPC routing flow of the deployed architecture:

```text
                                 [ Public Internet ]
                                         │
                         HTTPS (Port 3111) / SSH (Port 22)
                                         │
 ┌───────────────────────────────────────▼────────────────────────────────────────┐
 │ GCP VPC (iii-vpc-dev)                                                          │
 │                                                                                │
 │  ┌──────────────────────────────────────────────────────────────────────────┐  │
 │  │ Public Subnet (10.0.1.0/24)                                              │  │
 │  │                                                                          │  │
 │  │     ┌──────────────────────────────────────────────────────────────┐     │  │
 │  │     │ iii-engine-gateway (Compute Engine)                          │     │  │
 │  │     │                                                              │     │  │
 │  │     │ - Public IP: 35.239.123.59 (Binds port 3111 for public HTTP) │     │  │
 │  │     │ - Private IP: 10.0.1.2                                       │     │  │
 │  │     │ - Runs Core iii Orchestrator (State, Queue, HTTP Server)     │     │  │
 │  │     │ - Port 49134 bound internally for RPC WebSocket Gateway       │     │  │
 │  │     └──────────────▲───────────────────────────────▲───────────────┘     │  │
 │  │                    │ (WS-RPC Connection)           │ (WS-RPC)            │  │
 │  └────────────────────┼───────────────────────────────┼─────────────────────┘  │
 │                       │                               │                        │
 │  ┌────────────────────┼───────────────────────────────┼─────────────────────┐  │
 │  │ Private Subnet (10.0.2.0/24 - NO PUBLIC IPs)       │                     │  │
 │  │                    │                               │                     │  │
 │  │     ┌──────────────┴───────────────┐  ┌────────────┴─────────────────┐  │  │
 │  │     │ iii-caller-worker            │  │ iii-inference-worker         │  │  │
 │  │     │ (TypeScript VM - 10.0.2.3)   │  │ (Python VM - 10.0.2.2)       │  │  │
 │  │     │                              │  │                              │  │  │
 │  │     │ - Runs TS caller service     │  │ - Runs Python ML inference   │  │  │
 │  │     │ - Translates HTTP to math RPC│  │ - Performs sum operations    │  │  │
 │  │     │ - Saves cumulative totals    │  │ - Manages running sum state  │  │  │
 │  │     └──────────────────────────────┘  └──────────────────────────────┘  │  │
 │  └──────────────────────────────────────────────────────────────────────────┘  │
 │                                                                                │
 │  ┌───────────────────────────────┐                                             │
 │  │ Cloud Router & NAT Gateway     │◄─── (Private VMs download node_modules/     │
 │  │ (Secure egress internet access)│      python virtualenvs safely)            │
 │  └───────────────────────────────┘                                             │
 └────────────────────────────────────────────────────────────────────────────────┘
```

### 🔒 Network Hygiene Details
- **No Public IPs on Workers**: Worker VMs have **only** private IPs. They cannot be scanned, reached, or attacked from the internet.
- **Cloud NAT Egress**: The Private Subnet is bound to a Cloud Router & Cloud NAT Gateway, allowing worker VMs to safely fetch updates, compile packages (`npm install` / `pip install`), and resolve dependencies without exposing open ingress ports.
- **Secure Bastion-Jump Deployment**: Deployment of code and service configuration to the private VMs is achieved dynamically using the Gateway VM as an **SSH ProxyJump Bastion Host** (using `-o ProxyJump` over your secure GCP SSH key). No credentials or direct SSH routes are exposed publicly.

---

## ⚡ Live Verification

The JSON API gateway is successfully deployed and accepting RPC requests. You can verify the end-to-end flow with the following command:

### Exact Curl Request
```bash
curl -X POST http://35.239.123.59:3111/math/add-two-numbers \
  -H 'Content-Type: application/json' \
  -d '{"a": 100, "b": 200}'
```

### Sample Response
```json
{
  "c": 300,
  "running_total": 3640,
  "success": "You've connected two workers and they're interoperating seamlessly, now let's add a few more workers to expand this project's functionality."
}
```
*(Running the command multiple times will persistently increment the `running_total` state, stored inside the key-value state store engine on the central VM).*

---

## 🛠️ Instructions to Redeploy from Scratch

To tear down and recreate this entire architecture on a fresh Google Cloud Account, follow these simple steps:

### 1. Prerequisites & Auth
Make sure you have `gcloud` and `terraform` CLI tools installed on your local machine.

```bash
# Log in to your GCP account
gcloud auth login
gcloud auth application-default login

# Enable Compute Engine API on your active project
gcloud services enable compute.googleapis.com
```

### 2. Generate a Dedicated SSH Key
We will generate a passphrase-less key for completely automated, seamless deployment scripts:
```bash
ssh-keygen -t ed25519 -f ~/.ssh/id_gcp -N ""
```

### 3. Configure Terraform Variables
Open [infrastructure/environments/dev/terraform.tfvars](file:///home/vishal/Assignment/Alchemyst-ai_assignment/infrastructure/environments/dev/terraform.tfvars) and customize the GCP Project ID and SSH public key.
```hcl
project_id     = "YOUR_GCP_PROJECT_ID"
ssh_user       = "vishal"
ssh_public_key = "ssh-ed25519 AAAAC3... [content of ~/.ssh/id_gcp.pub] ..."
```

### 4. Provision Cloud Infrastructure
Navigate to the Dev environment and apply the Terraform files:
```bash
cd infrastructure/environments/dev
terraform init
terraform apply -auto-approve
```
*Wait ~1 minute. Terraform will output the public IP of the engine gateway VM and private IPs of the workers.*

### 5. Execute Automated Deployment
Navigate back to the repository root, make the orchestrator script executable, and run it:
```bash
cd ../../..
chmod +x scripts/deploy.sh
./scripts/deploy.sh
```

### 6. Verify
Run the printed `curl` command (substituting the newly created `engine_public_ip`) to verify end-to-end execution.

---

## 📝 Engineering Writeup: Production Hardening & Scale

### Part 1: Production Hardening Checklist
Before taking this system into a live production environment, we would implement the following security and reliability practices:
1. **Least-Privilege Service Accounts**: The current VMs are provisioned with full standard `cloud-platform` access scopes. In production, we would create customized GCP Service Accounts (IAM) containing strictly the permissions needed for each VM (e.g., read-only access to specific buckets or secret management).
2. **Encrypted State Backend**: Migrate the local Terraform state (`.tfstate` files) to a secure, version-controlled **Google Cloud Storage (GCS) Bucket** configured with Object Versioning, State Locking, and Customer-Managed Encryption Keys (CMEK) via Google KMS.
3. **Firewall Access Controls**: Restrict public ingress on SSH (port `22`) to a specified set of trusted source IP ranges (e.g. corporate VPN CIDR block) instead of `0.0.0.0/0`.
4. **HTTPS / TLS Encryption**: Secure the public API Gateway. Place the gateway VM behind a Google Cloud HTTP(S) Load Balancer configured with a Google-managed SSL Certificate (or run Nginx inside the gateway VM with Let's Encrypt certificates to terminate SSL on port `443` and proxy to `3111`).
5. **Observability & Health Checks**: Configure Prometheus/Grafana dashboards, wire up structured logging to Google Cloud Logging (fluentd), and set up Cloud Monitoring Uptime Alerts to automatically ping the `/math/add-two-numbers` endpoint.

### Part 2: Architecture for a 100x Larger Model (GPU Serving)
If the machine learning model were 100x larger, a simple systemd script running on a CPU-bound VM would suffer from catastrophic latency, Out-Of-Memory (OOM) failures, and inability to handle concurrent user load. We would redesign the serving layer as follows:
1. **Containerized Orchestration (Google Kubernetes Engine - GKE)**: Move from raw VMs to GKE to manage scaling and containerization natively. We would define dedicated worker deployments utilizing **GPU-enabled Node Pools** (e.g. NVIDIA T4 or L4/A100 instances).
2. **Model Serving Frameworks (vLLM / Triton)**: Instead of a custom Python entrypoint, we would wrap the large model in a production-grade inference server like **vLLM** or **NVIDIA Triton Inference Server**. These servers provide critical features like:
   - **Continuous Batching**: Merging multiple incoming user requests into a single GPU forward pass to maximize throughput.
   - **KV-Caching**: Storing conversational attention context to reduce inference compute requirements.
   - **Quantization (AWQ/GPTQ)**: Reducing the model size to FP8 or INT4 to run efficiently with smaller GPU memory footprints.
3. **Decoupled Queueing & Load Balancing**: Introduce a robust queue like **Apache Kafka** or a high-performance Redis/RabbitMQ queue in front of the inference workers. This buffers spikes in user requests, ensuring that when the GPU is fully occupied, incoming API requests are safely queued rather than dropping or causing timeout errors.
4. **Scale-to-Zero and Autoscaling (KEDA)**: Use Kubernetes Event-driven Autoscaling (KEDA) to monitor queue sizes and automatically scale the GPU worker deployments up or down based on load, optimizing expensive cloud GPU resource utilization.
