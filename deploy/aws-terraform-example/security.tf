resource "aws_security_group" "pinbot_alb_sg" {
  name        = "${var.name}-pinbot-alb-security-group-${terraform.workspace}"
  description = "${var.name} ${terraform.workspace} public security group to allow controlled inbound/outbount traffic"
  vpc_id      = "${aws_vpc.main.id}"

  ingress {
    protocol    = "tcp"
    from_port   = 443
    to_port     = 443
    cidr_blocks = ["0.0.0.0/0"]
  }

  egress {
    from_port = 0
    to_port   = 0
    protocol  = "-1"
    cidr_blocks = [
      "0.0.0.0/0"]
  }

  tags = {
    Name       = "${var.name} ${terraform.workspace} alb security group"
    Environment = "${terraform.workspace}"
  }
}

resource "aws_security_group" "pinbot_peer_sg" {
  name        = "${var.name}-pinbot-peer-security-group-${terraform.workspace}"
  description = "${var.name} ${terraform.workspace} pinbot peer security group to allow controlled inbound/outbount traffic"
  vpc_id      = "${aws_vpc.main.id}"

  ingress {
    from_port = 8081
    to_port   = 8081
    protocol  = "tcp"
    security_groups = ["${aws_security_group.pinbot_alb_sg.id}"]
  }

  ingress {
    from_port = 4002
    to_port   = 4002
    protocol  = "tcp"
    security_groups = ["${aws_security_group.pinbot_alb_sg.id}"]
  }

  egress {
    from_port = 0
    to_port   = 0
    protocol  = "-1"
    cidr_blocks = [
      "0.0.0.0/0"]
  }

  tags = {
    Name       = "${var.name} ${terraform.workspace} pinbot peer security group"
    Environment = "${terraform.workspace}"
  }
}