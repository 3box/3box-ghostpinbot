variable "aws_region" {
  default = "us-east-1"
}

variable "certificate_arn" {
  description = "valid certificate arn used for load balancer"
}

variable "az_count"  {
  description = "number of availability zones in a region"
  
  default = {
    dev  = 2
    prod = 2
  }
}

variable "name" {
  description =  "name"
  default = "pinbot"
}

variable "pinbot_count" {
  description = "number of pinbot containers to run"
  
  default = {
    dev  = 1
    prod = 1
  }
}

variable "pinbot_cpu" {
  description = "fargate cpu pinbot"
  
  default = {
    dev  = 2048
    prod = 2048
  }
}

variable "pinbot_memory" {
  description = "fargate memory pinbot"
  
  default = {
    dev  = 4096
    prod = 4096
  }
}