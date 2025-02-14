provider "aws" {
  region = "us-east-1"
}

resource "aws_instance" "kyc_backend" {
  ami           = "ami-0c55b159cbfafe1f0"  # Example AMI
  instance_type = "t2.micro"
  key_name      = "your-key"

  tags = {
    Name = "KYC-Backend"
  }
}
