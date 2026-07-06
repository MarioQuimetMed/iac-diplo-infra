# ─── CloudFront Distribution para el Frontend ──────────────────────────
# Permite servir el bucket S3 a través de HTTPS de AWS.

resource "aws_cloudfront_distribution" "frontend" {
  enabled             = true
  is_ipv6_enabled     = true
  default_root_object = "" # Se maneja por el S3 Website Endpoint
  price_class         = "PriceClass_100" # Opción más barata (Norteamérica y Europa)

  # Usamos el Website Endpoint de S3 como un Custom Origin para que respete
  # el enrutamiento de la SPA (index.html en errores).
  origin {
    domain_name = aws_s3_bucket_website_configuration.frontend.website_endpoint
    origin_id   = "FrontendS3Website"

    custom_origin_config {
      http_port              = 80
      https_port             = 443
      origin_protocol_policy = "http-only"
      origin_ssl_protocols   = ["TLSv1.2"]
    }
  }

  default_cache_behavior {
    allowed_methods  = ["GET", "HEAD", "OPTIONS"]
    cached_methods   = ["GET", "HEAD"]
    target_origin_id = "FrontendS3Website"

    forwarded_values {
      query_string = false
      cookies {
        forward = "none"
      }
    }

    viewer_protocol_policy = "redirect-to-https" # Obliga a usar HTTPS
    min_ttl                = 0
    default_ttl            = 3600
    max_ttl                = 86400
  }

  restrictions {
    geo_restriction {
      restriction_type = "none"
    }
  }

  viewer_certificate {
    cloudfront_default_certificate = true # Genera un dominio *.cloudfront.net gratis
  }
}

# ─── CloudFront Distribution para el Backend (ALB) ──────────────────────────
# Envuelve el Application Load Balancer en HTTPS

resource "aws_cloudfront_distribution" "backend" {
  enabled         = true
  is_ipv6_enabled = true
  price_class     = "PriceClass_100"

  origin {
    domain_name = aws_lb.main.dns_name
    origin_id   = "BackendALB"

    custom_origin_config {
      http_port              = 80
      https_port             = 443
      origin_protocol_policy = "http-only" # El ALB escucha en HTTP
      origin_ssl_protocols   = ["TLSv1.2"]
    }
  }

  default_cache_behavior {
    # Como es un backend/API, permitimos TODOS los métodos (POST, PUT, DELETE, etc.)
    allowed_methods  = ["DELETE", "GET", "HEAD", "OPTIONS", "PATCH", "POST", "PUT"]
    cached_methods   = ["GET", "HEAD"]
    target_origin_id = "BackendALB"

    forwarded_values {
      query_string = true
      headers      = ["*"] # Pasamos todos los headers al backend
      cookies {
        forward = "all"
      }
    }

    viewer_protocol_policy = "redirect-to-https"
    min_ttl                = 0
    default_ttl            = 0     # No cacheamos la API por defecto
    max_ttl                = 0
  }

  restrictions {
    geo_restriction {
      restriction_type = "none"
    }
  }

  viewer_certificate {
    cloudfront_default_certificate = true
  }
}
