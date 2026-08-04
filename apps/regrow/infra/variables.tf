variable "hostinger_api_token" {
  description = "Hostinger API token"
  type        = string
  sensitive   = true
}

variable "vps_hostname" {
  description = "VPS hostname"
  type        = string
  default     = "regrow-landing"
}

variable "ssh_public_key" {
  description = "Public SSH key for VPS access"
  type        = string
}

variable "db_password" {
  description = "PostgreSQL user password"
  type        = string
  sensitive   = true
}
