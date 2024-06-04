data "aws_route53_zone" "hosted_zone" {
  name = "app.etgarmadaim.com"
}

resource "aws_route53_record" "site_domain" {
  zone_id = data.aws_route53_zone.hosted_zone.zone_id
  name    = "www"
  type    = "A"
  ttl = 300
  records = [
    aws_instance.school-app.public_ip,
  ]
}
