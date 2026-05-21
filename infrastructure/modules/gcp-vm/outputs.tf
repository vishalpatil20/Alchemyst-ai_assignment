output "engine_public_ip" {
  description = "The public IP of the Engine/Gateway instance"
  value       = google_compute_instance.engine.network_interface[0].access_config[0].nat_ip
}

output "engine_private_ip" {
  description = "The private IP of the Engine/Gateway instance"
  value       = google_compute_instance.engine.network_interface[0].network_ip
}

output "caller_private_ip" {
  description = "The private IP of the Caller Worker instance"
  value       = google_compute_instance.caller.network_interface[0].network_ip
}

output "inference_private_ip" {
  description = "The private IP of the Inference Worker instance"
  value       = google_compute_instance.inference.network_interface[0].network_ip
}
