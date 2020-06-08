/******************************************************************************
  ALB (Application Load Balancer)
*******************************************************************************/

resource "aws_alb" "pinbot_alb" {
  name            = "pinbot-alb-${terraform.workspace}"
  subnets         = ["${aws_subnet.public.*.id}"]
  security_groups = ["${aws_security_group.pinbot_alb_sg.id}"]
  idle_timeout    = 150
}

resource "aws_alb_target_group" "pinbot_peer_ws_tg" {
  name        = "pinbot-peer-${terraform.workspace}"
  port        = 4002
  protocol    = "HTTP"
  vpc_id      = "${aws_vpc.main.id}"
  target_type = "ip"

  health_check {
    interval = 30
    path = "/api/v0/peer"
    port = 8081
    protocol = "HTTP"
    matcher = "200"
    healthy_threshold = 2
    unhealthy_threshold = 3
  }
}

resource "aws_alb_target_group" "pinbot_api_tg" {
  name        = "profile-api-${terraform.workspace}"
  port        = 8081
  protocol    = "HTTP"
  vpc_id      = "${aws_vpc.main.id}"
  target_type = "ip"

  health_check {
    interval = 30
    path = "/api/v0/peer"
    port = 8081
    protocol = "HTTP"
    matcher = "200"
    healthy_threshold = 2
    unhealthy_threshold = 3
  }
}

resource "aws_alb_listener" "https_lb" {
  load_balancer_arn = "${aws_alb.pinbot_alb.id}"
  port              = "443"
  protocol          = "HTTPS"
  ssl_policy        = "ELBSecurityPolicy-2016-08"
  certificate_arn   = "${var.certificate_arn}"

  default_action {
    target_group_arn = "${aws_alb_target_group.pinbot_api_tg.id}"
    type             = "forward"
  }
}

resource "aws_alb_listener_rule" "paths_to_api" {
  listener_arn = "${aws_alb_listener.https_lb.arn}"
  priority     = 101

  action {
    type             = "forward"
    target_group_arn = "${aws_alb_target_group.pinbot_api_tg.id}"
  }

  condition {
    field  = "path-pattern"
    values = ["/*"]
  }
}

resource "aws_alb_listener_rule" "paths_to_pinbot_peer" {
  listener_arn = "${aws_alb_listener.https_lb.arn}"
  priority     = 100

  action {
    type             = "forward"
    target_group_arn = "${aws_alb_target_group.pinbot_peer_ws_tg.id}"
  }

  condition {
    field  = "path-pattern"
    values = ["/"]
  }
}

resource "aws_alb_listener_rule" "paths_to_pinbot_peer_sub" {
  listener_arn = "${aws_alb_listener.https_lb.arn}"
  priority     = 99

  action {
    type             = "forward"
    target_group_arn = "${aws_alb_target_group.pinbot_peer_ws_tg.id}"
  }

  condition {
    field  = "path-pattern"
    values = ["/ipfs/*"]
  }
}

