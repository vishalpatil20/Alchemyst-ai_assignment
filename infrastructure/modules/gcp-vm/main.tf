data "google_compute_image" "ubuntu" {
  family  = "ubuntu-2204-lts"
  project = "ubuntu-os-cloud"
}

# 1. Engine / Gateway VM (Public Subnet)
resource "google_compute_instance" "engine" {
  name         = "iii-engine-gateway"
  machine_type = var.engine_machine_type
  zone         = var.zone
  project      = var.project_id

  tags = ["iii-gateway", "iii-node"]

  boot_disk {
    initialize_params {
      image = data.google_compute_image.ubuntu.self_link
      size  = 20
      type  = "pd-standard"
    }
  }

  network_interface {
    subnetwork = var.public_subnet_id

    access_config {
      // Ephemeral public IP
    }
  }

  metadata = {
    ssh-keys = "${var.ssh_user}:${var.ssh_public_key}"
    startup-script = <<-EOT
      #!/bin/bash
      apt-get update
      apt-get install -y curl git build-essential ufw
      
      # Install iii
      curl -fsSL https://install.iii.dev/iii/main/install.sh | sh
      
      # Copy binaries to /usr/local/bin so they are globally available for systemd and all users
      if [ -f /root/.local/bin/iii ]; then
        cp /root/.local/bin/iii* /usr/local/bin/
      fi
      
      # Also install for default vishal user just in case
      sudo -u ${var.ssh_user} curl -fsSL https://install.iii.dev/iii/main/install.sh | sh
    EOT
  }

  service_account {
    scopes = ["cloud-platform"]
  }
}

# 2. Caller Worker VM (Private Subnet)
resource "google_compute_instance" "caller" {
  name         = "iii-caller-worker"
  machine_type = var.caller_machine_type
  zone         = var.zone
  project      = var.project_id

  tags = ["iii-node"]

  boot_disk {
    initialize_params {
      image = data.google_compute_image.ubuntu.self_link
      size  = 20
      type  = "pd-standard"
    }
  }

  network_interface {
    subnetwork = var.private_subnet_id
  }

  metadata = {
    ssh-keys = "${var.ssh_user}:${var.ssh_public_key}"
    startup-script = <<-EOT
      #!/bin/bash
      apt-get update
      apt-get install -y curl git build-essential
      
      # Install Node.js 20
      curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
      apt-get install -y nodejs
    EOT
  }

  service_account {
    scopes = ["cloud-platform"]
  }
}

# 3. Inference Worker VM (Private Subnet)
resource "google_compute_instance" "inference" {
  name         = "iii-inference-worker"
  machine_type = var.inference_machine_type
  zone         = var.zone
  project      = var.project_id

  tags = ["iii-node"]

  boot_disk {
    initialize_params {
      image = data.google_compute_image.ubuntu.self_link
      size  = 30
      type  = "pd-standard"
    }
  }

  network_interface {
    subnetwork = var.private_subnet_id
  }

  metadata = {
    ssh-keys = "${var.ssh_user}:${var.ssh_public_key}"
    startup-script = <<-EOT
      #!/bin/bash
      apt-get update
      apt-get install -y curl git python3 python3-pip python3-venv build-essential
    EOT
  }

  service_account {
    scopes = ["cloud-platform"]
  }
}
