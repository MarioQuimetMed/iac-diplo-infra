resource "aws_cloudwatch_log_group" "nats" {
  name              = "/ecs/${var.project_name}/nats"
  retention_in_days = 7
}


resource "aws_cloudwatch_log_group" "notifications" {
  name              = "/ecs/${var.project_name}/notifications"
  retention_in_days = 7
}

resource "aws_cloudwatch_log_group" "inventories" {
  name              = "/ecs/${var.project_name}/inventories"
  retention_in_days = 7
}

resource "aws_cloudwatch_log_group" "reservations" {
  name              = "/ecs/${var.project_name}/reservations"
  retention_in_days = 7
}
