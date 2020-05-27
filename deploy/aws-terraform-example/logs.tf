/******************************************************************************
  Logs
*******************************************************************************/

resource "aws_cloudwatch_log_group" "pinbot_peer" {
  name = "${var.name}-pinbot-peer-${terraform.workspace}"
}