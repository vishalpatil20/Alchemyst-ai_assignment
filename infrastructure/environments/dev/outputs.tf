output "engine_public_ip" {
  description = "The public IP of the Engine/Gateway instance"
  value       = module.vm.engine_public_ip
}

output "engine_private_ip" {
  description = "The private IP of the Engine/Gateway instance"
  value       = module.vm.engine_private_ip
}

output "caller_private_ip" {
  description = "The private IP of the Caller Worker instance"
  value       = module.vm.caller_private_ip
}

output "inference_private_ip" {
  description = "The private IP of the Inference Worker instance"
  value       = module.vm.inference_private_ip
}
