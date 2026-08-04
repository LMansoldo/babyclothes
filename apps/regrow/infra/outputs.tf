output "vps_ip" {
  description = "VPS public IP"
  value       = hostinger_vps.landing.ip_address
}

output "db_url" {
  description = "DATABASE_URL for the application .env"
  value       = "postgresql://regrow:${var.db_password}@localhost:5432/regrow_db"
  sensitive   = true
}
