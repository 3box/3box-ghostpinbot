data "aws_region" "current" {}

# ECS Cluster, includes Ghost Pinbot service
resource "aws_ecs_cluster" "pinbot_cl" {
  name = "${var.name}-ecs-cluster-${terraform.workspace}"
}

# CAS API Task/Container Definition
resource "aws_ecs_task_definition" "pinbot_td" {
  family                   = "${var.name}-pinbot-peer-ecs-task-definition-${terraform.workspace}"
  network_mode             = "awsvpc"
  requires_compatibilities = ["FARGATE"]
  cpu                      = "${lookup(var.pinbot_cpu, terraform.workspace)}"
  memory                   = "${lookup(var.pinbot_memory, terraform.workspace)}"
  execution_role_arn       = "${aws_iam_role.pinbot_ecs_task_execution_role.arn}"

  container_definitions = <<DEFINITION
[
  {
    "cpu": ${lookup(var.pinbot_cpu, terraform.workspace)},
    "image": "simonovic86/pinbot:v5",
    "memory": ${lookup(var.pinbot_memory, terraform.workspace)},
    "name": "pinbot_peer",
    "networkMode": "awsvpc",
    "portMappings": [
      {
        "containerPort": 4002,
        "protocol": "tcp",
        "hostPort": 4002
      },
      {
        "containerPort": 8081,
        "protocol": "tcp",
        "hostPort": 8081
      }
    ],
    "environment": [
      { "name": "EXECUTION_MODE", "value": "BUNDLED" }
    ],
    "logConfiguration": {
      "logDriver": "awslogs",
      "options": {
        "awslogs-group": "${aws_cloudwatch_log_group.pinbot_peer.name}",
        "awslogs-region": "${data.aws_region.current.name}",
        "awslogs-stream-prefix" : "pinbot-peer"
      }
    }
  }
]
DEFINITION
}

# Create Ghost Peer, connecting task definition, lb, and net
resource "aws_ecs_service" "pinbot_peer_service" {
  name            = "${var.name}-pinbot-peer-ecs-service-${terraform.workspace}"
  cluster         = "${aws_ecs_cluster.pinbot_cl.id}"
  task_definition = "${aws_ecs_task_definition.pinbot_td.arn}"
  desired_count   = "${lookup(var.pinbot_count, terraform.workspace)}"
  launch_type     = "FARGATE"

  network_configuration {
    security_groups = ["${aws_security_group.pinbot_peer_sg.id}"]
    subnets         = ["${aws_subnet.private.*.id}"]
  }

  load_balancer {
    target_group_arn = "${aws_alb_target_group.pinbot_api_tg.id}"
    container_name   = "pinbot_peer"
    container_port   = 8081
  }

  load_balancer {
    target_group_arn = "${aws_alb_target_group.pinbot_peer_ws_tg.id}"
    container_name   = "pinbot_peer"
    container_port   = 4002
  }

  depends_on = ["aws_alb_listener.https_lb"]

  lifecycle {
    ignore_changes = ["desired_count"]
  }
}
