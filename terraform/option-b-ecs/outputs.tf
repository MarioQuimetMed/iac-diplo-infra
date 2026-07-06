output "alb_dns_name" {
  description = "URL pública del ALB."
  value       = aws_lb.main.dns_name
}


output "ecr_notifications_repository_url" {
  description = "URL del repo ECR para notifications."
  value       = aws_ecr_repository.notifications.repository_url
}

output "ecr_login_command" {
  description = "Comando para autenticar Docker contra ECR."
  value       = "aws ecr get-login-password --region ${var.aws_region} | docker login --username AWS --password-stdin ${local.ecr_registry}"
}

output "cluster_name" {
  description = "Nombre del cluster ECS."
  value       = aws_ecs_cluster.main.name
}

output "service_discovery_namespace" {
  description = "Namespace DNS interno."
  value       = aws_service_discovery_private_dns_namespace.main.name
}


output "ecr_inventories_repository_url" {
  description = "URL del repo ECR para inventories."
  value       = aws_ecr_repository.inventories.repository_url
}

output "ecr_reservations_repository_url" {
  description = "URL del repo ECR para reservations."
  value       = aws_ecr_repository.reservations.repository_url
}

output "frontend_website_endpoint" {
  description = "URL pública del S3 Frontend."
  value       = aws_s3_bucket_website_configuration.frontend.website_endpoint
}

output "frontend_https_url" {
  description = "URL HTTPS del Frontend (vía CloudFront)."
  value       = "https://${aws_cloudfront_distribution.frontend.domain_name}"
}

output "backend_https_url" {
  description = "URL HTTPS del Backend API (vía CloudFront)."
  value       = "https://${aws_cloudfront_distribution.backend.domain_name}"
}
