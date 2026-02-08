variable "aws_region" {
  description = "AWS Region to deploy to"
  type        = string
  default     = "ap-south-1" 
}

variable "project_name" {
  description = "Project name tag"
  type        = string
  default     = "spendsense-ai"
}

variable "db_password" {
  description = "Password for the RDS postgres user"
  type        = string
  sensitive   = true
  # In production, pass this via -var="db_password=..." or env var TF_VAR_db_password
  default     = "TopSecretPassword123!" 
}

variable "public_key_path" {
  description = "Path to the public SSH key to deploy"
  type        = string
  default     = "./spendsense-key.pub"
}

variable "instance_type" {
  description = "EC2 instance type"
  type        = string
  default     = "t4g.micro"
}

variable "db_instance_class" {
  description = "RDS instance class"
  type        = string
  default     = "db.t4g.micro"
}
