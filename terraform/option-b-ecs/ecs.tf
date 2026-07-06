resource "aws_ecs_cluster" "main" {
  name = "${var.project_name}-cluster"

  setting {
    name  = "containerInsights"
    value = "disabled"
  }
}

# data "aws_caller_identity" "current" {}

locals {
  account_id          = data.aws_caller_identity.current.account_id
  ecr_registry        = "${local.account_id}.dkr.ecr.${var.aws_region}.amazonaws.com"

  notifications_image = "${aws_ecr_repository.notifications.repository_url}:${var.image_tag}"
  inventories_image   = "${aws_ecr_repository.inventories.repository_url}:${var.image_tag}"
  reservations_image  = "${aws_ecr_repository.reservations.repository_url}:${var.image_tag}"

  nats_dns_url = "nats://nats.${aws_service_discovery_private_dns_namespace.main.name}:4222"

  # endpoint ya incluye :5432, no duplicar el puerto
  postgres_url = "postgres://${var.db_user}:${var.db_password}@${aws_db_instance.hotel.endpoint}/${var.db_name}"

  DB_HOST     = aws_db_instance.hotel.address
  DB_PORT     = tostring(aws_db_instance.hotel.port)
  DB_NAME     = var.db_name
  DB_USERNAME = var.db_user
  DB_PASSWORD = var.db_password
}

resource "aws_ecs_task_definition" "nats" {
  family                   = "${var.project_name}-nats"
  cpu                      = var.task_cpu
  memory                   = var.task_memory
  network_mode             = "awsvpc"
  requires_compatibilities = ["FARGATE"]
  execution_role_arn       = aws_iam_role.task_execution.arn

  container_definitions = jsonencode([{
    name      = "nats"
    image     = "nats:2.10-alpine"
    essential = true
    command   = ["-js", "-m", "8222"]
    portMappings = [
      { containerPort = 4222, protocol = "tcp" },
      { containerPort = 8222, protocol = "tcp" }
    ]
    logConfiguration = {
      logDriver = "awslogs"
      options = {
        awslogs-group         = aws_cloudwatch_log_group.nats.name
        awslogs-region        = var.aws_region
        awslogs-stream-prefix = "nats"
      }
    }
  }])
}


resource "aws_ecs_task_definition" "notifications" {
  family                   = "${var.project_name}-notifications"
  cpu                      = var.task_cpu
  memory                   = var.task_memory
  network_mode             = "awsvpc"
  requires_compatibilities = ["FARGATE"]
  execution_role_arn       = aws_iam_role.task_execution.arn

  container_definitions = jsonencode([{
    name      = "notifications"
    image     = local.notifications_image
    essential = true
    environment = [
      { name = "NATS_URL", value = local.nats_dns_url }
    ]
    logConfiguration = {
      logDriver = "awslogs"
      options = {
        awslogs-group         = aws_cloudwatch_log_group.notifications.name
        awslogs-region        = var.aws_region
        awslogs-stream-prefix = "notifications"
      }
    }
  }])
}

resource "aws_ecs_service" "nats" {
  name            = "nats"
  cluster         = aws_ecs_cluster.main.id
  task_definition = aws_ecs_task_definition.nats.arn
  desired_count   = 1
  launch_type     = "FARGATE"

  network_configuration {
    subnets          = aws_subnet.public[*].id
    security_groups  = [aws_security_group.nats.id]
    assign_public_ip = true
  }

  service_registries {
    registry_arn = aws_service_discovery_service.nats.arn
  }
}


resource "aws_ecs_service" "notifications" {
  name            = "notifications"
  cluster         = aws_ecs_cluster.main.id
  task_definition = aws_ecs_task_definition.notifications.arn
  desired_count   = var.notifications_desired_count
  launch_type     = "FARGATE"

  network_configuration {
    subnets          = aws_subnet.public[*].id
    security_groups  = [aws_security_group.notifications.id]
    assign_public_ip = true
  }

  service_registries {
    registry_arn = aws_service_discovery_service.notifications.arn
  }
}

resource "aws_ecs_task_definition" "inventories" {
  family                   = "${var.project_name}-inventories"
  cpu                      = var.task_cpu
  memory                   = var.task_memory
  network_mode             = "awsvpc"
  requires_compatibilities = ["FARGATE"]
  execution_role_arn       = aws_iam_role.task_execution.arn

  container_definitions = jsonencode([{
    name      = "inventories"
    image     = local.inventories_image
    essential = true
    portMappings = [
      { containerPort = 3000, protocol = "tcp" }
    ]
    environment = [
      { name = "NATS_URL", value = local.nats_dns_url },
      { name = "PORT", value = "3000" },
      { name = "DATABASE_URL", value = local.postgres_url },
      { name = "DB_HOST", value = local.DB_HOST },
      { name = "DB_PORT", value = local.DB_PORT },
      { name = "DB_NAME", value = local.DB_NAME },
      { name = "DB_USERNAME", value = local.DB_USERNAME },
      { name = "DB_PASSWORD", value = local.DB_PASSWORD },
      { name = "DB_SYNCHRONIZE", value = "true" },
    ]
    logConfiguration = {
      logDriver = "awslogs"
      options = {
        awslogs-group         = aws_cloudwatch_log_group.inventories.name
        awslogs-region        = var.aws_region
        awslogs-stream-prefix = "inventories"
      }
    }
  }])
}

resource "aws_ecs_task_definition" "reservations" {
  family                   = "${var.project_name}-reservations"
  cpu                      = var.task_cpu
  memory                   = var.task_memory
  network_mode             = "awsvpc"
  requires_compatibilities = ["FARGATE"]
  execution_role_arn       = aws_iam_role.task_execution.arn

  container_definitions = jsonencode([{
    name      = "reservations"
    image     = local.reservations_image
    essential = true
    portMappings = [
      { containerPort = 3000, protocol = "tcp" }
    ]
    environment = [
      { name = "NATS_URL", value = local.nats_dns_url },
      { name = "PORT", value = "3000" },
      { name = "DATABASE_URL", value = local.postgres_url },
      { name = "DB_HOST", value = local.DB_HOST },
      { name = "DB_PORT", value = local.DB_PORT },
      { name = "DB_NAME", value = local.DB_NAME },
      { name = "DB_USERNAME", value = local.DB_USERNAME },
      { name = "DB_PASSWORD", value = local.DB_PASSWORD },
      { name = "DB_SYNCHRONIZE", value = "true" },
    ]
    logConfiguration = {
      logDriver = "awslogs"
      options = {
        awslogs-group         = aws_cloudwatch_log_group.reservations.name
        awslogs-region        = var.aws_region
        awslogs-stream-prefix = "reservations"
      }
    }
  }])
}

resource "aws_ecs_service" "inventories" {
  name            = "inventories"
  cluster         = aws_ecs_cluster.main.id
  task_definition = aws_ecs_task_definition.inventories.arn
  desired_count   = var.inventories_desired_count
  launch_type     = "FARGATE"

  network_configuration {
    subnets          = aws_subnet.public[*].id
    security_groups  = [aws_security_group.inventories.id]
    assign_public_ip = true
  }

  load_balancer {
    target_group_arn = aws_lb_target_group.inventories.arn
    container_name   = "inventories"
    container_port   = 3000
  }

  service_registries {
    registry_arn = aws_service_discovery_service.inventories.arn
  }

  depends_on = [aws_lb_listener.http]
}

resource "aws_ecs_service" "reservations" {
  name            = "reservations"
  cluster         = aws_ecs_cluster.main.id
  task_definition = aws_ecs_task_definition.reservations.arn
  desired_count   = var.reservations_desired_count
  launch_type     = "FARGATE"

  network_configuration {
    subnets          = aws_subnet.public[*].id
    security_groups  = [aws_security_group.reservations.id]
    assign_public_ip = true
  }

  load_balancer {
    target_group_arn = aws_lb_target_group.reservations.arn
    container_name   = "reservations"
    container_port   = 3000
  }

  service_registries {
    registry_arn = aws_service_discovery_service.reservations.arn
  }

  depends_on = [aws_lb_listener.http]
}
