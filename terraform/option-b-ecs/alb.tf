resource "aws_lb" "main" {
  name               = "${var.project_name}-alb"
  internal           = false
  load_balancer_type = "application"
  security_groups    = [aws_security_group.alb.id]
  subnets            = aws_subnet.public[*].id
}

resource "aws_lb_target_group" "reservations" {
  name        = "${var.project_name}-reservations-tg"
  port        = 3000
  protocol    = "HTTP"
  target_type = "ip"
  vpc_id      = aws_vpc.main.id

  health_check {
    path                = "/reservations/status/healthcheck"
    healthy_threshold   = 2
    unhealthy_threshold = 3
    interval            = 15
    timeout             = 5
    matcher             = "200-404"
  }

  deregistration_delay = 10
}

resource "aws_lb_listener" "http" {
  load_balancer_arn = aws_lb.main.arn
  port              = 80
  protocol          = "HTTP"

  default_action {
    type = "fixed-response"

    fixed_response {
      content_type = "text/plain"
      message_body = "Not Found (ALB Default Action)"
      status_code  = "404"
    }
  }
}

resource "aws_lb_listener_rule" "reservations" {
  listener_arn = aws_lb_listener.http.arn
  priority     = 200

  action {
    type             = "forward"
    target_group_arn = aws_lb_target_group.reservations.arn
  }

  condition {
    path_pattern {
      values = ["/reservations", "/reservations/*"]
    }
  }
}

resource "aws_lb_listener_rule" "inventories" {
  listener_arn = aws_lb_listener.http.arn
  priority     = 300

  action {
    type             = "forward"
    target_group_arn = aws_lb_target_group.inventories.arn
  }

  condition {
    path_pattern {
      values = ["/inventories", "/inventories/*"]
    }
  }
}


resource "aws_lb_target_group" "inventories" {
  name        = "${var.project_name}-inventories-tg"
  port        = 3000
  protocol    = "HTTP"
  target_type = "ip"
  vpc_id      = aws_vpc.main.id

  health_check {
    path                = "/inventories/status/healthcheck"
    healthy_threshold   = 2
    unhealthy_threshold = 3
    interval            = 15
    timeout             = 5
    matcher             = "200-404" # NestJS devuelve 404 si la ruta no existe, lo que indicará que el server está vivo
  }

  deregistration_delay = 10
}
