output "alb_hostname" {
  value = "${aws_alb.pinbot_alb.dns_name}"
}
