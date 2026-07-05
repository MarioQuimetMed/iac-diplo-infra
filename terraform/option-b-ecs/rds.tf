

resource "aws_db_instance" "hotel" {
  identifier             = "hotel"
  instance_class         = "db.t3.micro"
  allocated_storage      = 5
  engine                 = "postgres"
  engine_version         = "18.3"
  db_name                = var.db_name
  username               = var.db_user
  password               = var.db_password
  db_subnet_group_name   = aws_db_subnet_group.hotel.name
  vpc_security_group_ids = [aws_security_group.rds.id]
  parameter_group_name   = aws_db_parameter_group.hotel.name
  publicly_accessible    = true
  skip_final_snapshot    = true
}

resource "aws_db_subnet_group" "hotel" {
  name       = "${var.project_name}-hotel-db-subnets"
  subnet_ids = aws_subnet.public[*].id

  tags = { Name = "${var.project_name}-hotel-db-subnets" }
}

resource "aws_db_parameter_group" "hotel" {
  name   = "${var.project_name}-hotel-pg"
  family = "postgres18"

  tags = { Name = "${var.project_name}-hotel-pg" }
}