# ---------------------------------------------------------------------------------------------------------------------
# ECS Service ROLE
# ---------------------------------------------------------------------------------------------------------------------

resource "aws_iam_role" "pinbot_ecs_task_execution_role" {
  name               = "${var.name}-ecs-task-execution-role-${terraform.workspace}"
  assume_role_policy = "${data.aws_iam_policy_document.pinbot_assume_role_policy.json}"

  tags = {
    Name       = "${var.name} ${terraform.workspace} ECS task execution role"
    Environment = "${terraform.workspace}"
  }
}

data "aws_iam_policy_document" "pinbot_assume_role_policy" {
  statement {
    actions = ["sts:AssumeRole"]

    principals {
      type        = "Service"
      identifiers = ["ecs-tasks.amazonaws.com"]
    }
  }
}

resource "aws_iam_role_policy_attachment" "pinbot_ecs_task_execution_role_policy" {
  role       = "${aws_iam_role.pinbot_ecs_task_execution_role.name}"
  policy_arn = "arn:aws:iam::aws:policy/service-role/AmazonECSTaskExecutionRolePolicy"
}