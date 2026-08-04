terraform {
  required_providers {
    hostinger = {
      source  = "hostinger/hostinger"
      version = "~> 1.0"
    }
  }
}

provider "hostinger" {
  api_token = var.hostinger_api_token
}

resource "hostinger_vps" "landing" {
  plan     = "KVM 2"
  os       = "ubuntu_24_04"
  hostname = var.vps_hostname
  region   = "br"

  ssh_keys = [var.ssh_public_key]
}

resource "null_resource" "setup" {
  depends_on = [hostinger_vps.landing]

  connection {
    type        = "ssh"
    host        = hostinger_vps.landing.ip_address
    user        = "root"
    private_key = file("~/.ssh/id_rsa")
  }

  provisioner "remote-exec" {
    inline = [
      "apt-get update -y && apt-get upgrade -y",
      "apt-get install -y postgresql postgresql-contrib nodejs npm",
      "npm install -g pm2",
      "sudo -u postgres psql -c \"CREATE USER regrow WITH PASSWORD '${var.db_password}';\"",
      "sudo -u postgres psql -c \"CREATE DATABASE regrow_db OWNER regrow;\"",
      "sudo -u postgres psql -c \"GRANT ALL PRIVILEGES ON DATABASE regrow_db TO regrow;\"",
      "systemctl enable postgresql",
      "systemctl start postgresql",
    ]
  }
}

resource "hostinger_dns_zone" "landing_a" {
  depends_on = [hostinger_vps.landing]

  domain = "regrow.com.br"
  type   = "A"
  name   = "@"
  value  = hostinger_vps.landing.ip_address
  ttl    = 300
}

resource "hostinger_dns_zone" "landing_www" {
  depends_on = [hostinger_vps.landing]

  domain = "regrow.com.br"
  type   = "A"
  name   = "www"
  value  = hostinger_vps.landing.ip_address
  ttl    = 300
}
