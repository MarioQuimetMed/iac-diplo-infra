resource "aws_security_group" "alb" {
  name        = "${var.project_name}-alb-sg"
  description = "Permite HTTP entrante desde internet hacia el ALB"
  vpc_id      = aws_vpc.main.id

  ingress {
    description = "HTTP desde internet"
    from_port   = 80
    to_port     = 80
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = { Name = "${var.project_name}-alb-sg" }
}


resource "aws_security_group" "notifications" {
  name        = "${var.project_name}-notifications-sg"
  description = "notifications no acepta entrante (microservicio NATS puro)"
  vpc_id      = aws_vpc.main.id

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = { Name = "${var.project_name}-notifications-sg" }
}

resource "aws_security_group" "nats" {
  name        = "${var.project_name}-nats-sg"
  description = "Broker NATS: ingreso solo desde orders y notifications"
  vpc_id      = aws_vpc.main.id

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = { Name = "${var.project_name}-nats-sg" }
}

# Reglas separadas para evitar dependencias circulares entre SGs.

resource "aws_vpc_security_group_ingress_rule" "nats_from_notifications" {
  security_group_id            = aws_security_group.nats.id
  referenced_security_group_id = aws_security_group.notifications.id
  ip_protocol                  = "tcp"
  from_port                    = 4222
  to_port                      = 4222
  description                  = "NATS desde notifications"
}

resource "aws_vpc_security_group_ingress_rule" "nats_from_inventories" {
  security_group_id            = aws_security_group.nats.id
  referenced_security_group_id = aws_security_group.inventories.id
  ip_protocol                  = "tcp"
  from_port                    = 4222
  to_port                      = 4222
  description                  = "NATS desde inventories"
}

resource "aws_vpc_security_group_ingress_rule" "nats_from_reservations" {
  security_group_id            = aws_security_group.nats.id
  referenced_security_group_id = aws_security_group.reservations.id
  ip_protocol                  = "tcp"
  from_port                    = 4222
  to_port                      = 4222
  description                  = "NATS desde reservations"
}



resource "aws_security_group" "inventories" {
  name        = "${var.project_name}-inventories-sg"
  description = "inventories: no acepta entrante (conecta a DB y NATS)"
  vpc_id      = aws_vpc.main.id


  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = { Name = "${var.project_name}-inventories-sg" }
}

resource "aws_security_group" "reservations" {
  name        = "${var.project_name}-reservations-sg"
  description = "reservations: HTTP entrante desde el ALB"
  vpc_id      = aws_vpc.main.id

  ingress {
    description     = "HTTP desde ALB"
    from_port       = 3000
    to_port         = 3000
    protocol        = "tcp"
    security_groups = [aws_security_group.alb.id]
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = { Name = "${var.project_name}-reservations-sg" }
}

resource "aws_security_group" "rds" {
  name        = "${var.project_name}-rds-sg"
  description = "RDS PostgreSQL: 5432 desde la VPC"
  vpc_id      = aws_vpc.main.id

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = { Name = "${var.project_name}-rds-sg" }
}

# Solo accesible desde microservicios

resource "aws_vpc_security_group_ingress_rule" "rds_from_inventories" {
  security_group_id            = aws_security_group.rds.id
  referenced_security_group_id = aws_security_group.inventories.id
  ip_protocol                  = "tcp"
  from_port                    = 5432
  to_port                      = 5432
  description                  = "PostgreSQL desde inventories"
}

resource "aws_vpc_security_group_ingress_rule" "rds_from_reservations" {
  security_group_id            = aws_security_group.rds.id
  referenced_security_group_id = aws_security_group.reservations.id
  ip_protocol                  = "tcp"
  from_port                    = 5432
  to_port                      = 5432
  description                  = "PostgreSQL desde reservations"
}
