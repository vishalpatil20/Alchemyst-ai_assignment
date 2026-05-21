variable "project_id" {
  description = "The GCP project ID"
  type        = string
}

variable "region" {
  description = "The GCP region"
  type        = string
  default     = "us-central1"
}

variable "zone" {
  description = "The GCP zone"
  type        = string
  default     = "us-central1-a"
}

variable "network_name" {
  description = "The name of the VPC network"
  type        = string
}

variable "public_subnet_id" {
  description = "The public subnet self-link or ID"
  type        = string
}

variable "private_subnet_id" {
  description = "The private subnet self-link or ID"
  type        = string
}

variable "ssh_user" {
  description = "SSH username for accessing the instances"
  type        = string
  default     = "vishal"
}

variable "ssh_public_key" {
  description = "Public SSH key content to authorize on instances"
  type        = string
}

variable "engine_machine_type" {
  description = "Machine type for the Engine/Gateway instance"
  type        = string
  default     = "e2-small"
}

variable "caller_machine_type" {
  description = "Machine type for the TypeScript Caller Worker"
  type        = string
  default     = "e2-micro"
}

variable "inference_machine_type" {
  description = "Machine type for the Python Inference Worker"
  type        = string
  default     = "e2-small"
}
