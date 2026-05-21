terraform {
  required_version = ">= 1.0.0"
  required_providers {
    google = {
      source  = "hashicorp/google"
      version = "~> 5.0"
    }
  }
}

provider "google" {
  project = var.project_id
  region  = var.region
  zone    = var.zone
}

module "network" {
  source       = "../../modules/gcp-network"
  project_id   = var.project_id
  region       = var.region
  network_name = var.network_name
}

module "vm" {
  source           = "../../modules/gcp-vm"
  project_id       = var.project_id
  region           = var.region
  zone             = var.zone
  network_name     = module.network.network_name
  public_subnet_id = module.network.public_subnet_self_link
  private_subnet_id = module.network.private_subnet_self_link
  ssh_user         = var.ssh_user
  ssh_public_key   = var.ssh_public_key

  engine_machine_type    = var.engine_machine_type
  caller_machine_type    = var.caller_machine_type
  inference_machine_type = var.inference_machine_type
}
