output "ec2_public_ip" {
  description = "Public IP of the web server"
  value       = aws_instance.web.public_ip
}

output "ec2_public_dns" {
  description = "Public DNS of the web server"
  value       = aws_instance.web.public_dns
}

output "rds_endpoint" {
  description = "RDS Connection Endpoint"
  value       = aws_db_instance.postgres.endpoint
}

output "rds_username" {
  description = "RDS Username"
  value       = aws_db_instance.postgres.username
}
