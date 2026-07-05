terraform {
  backend "s3" {
    bucket         = "${var.project_name}-tfstate-286273776844"
    key            = "option-b-ecs/terraform.tfstate"
    region         = "us-east-1"
    encrypt        = true
    dynamodb_table = "test-nest-tf-lock"
  }

  required_version = ">= 1.6.0"

  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.60"
    }
  }
}

provider "aws" {
  region     = var.aws_region
  access_key = var.access_key
  secret_key = var.secret_key

  default_tags {
    tags = {
      Project   = var.project_name
      ManagedBy = "Terraform"
      Course    = "IaC"
    }
  }
}
