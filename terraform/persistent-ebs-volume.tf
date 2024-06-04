resource "aws_ebs_volume" "school-app-persistent" {
  availability_zone = "eu-central-1b"
  size              = 4

  tags = {
    Name = "school-app-persistent-volume"
  }
}

