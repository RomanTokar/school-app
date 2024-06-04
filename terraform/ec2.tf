resource "aws_instance" "school-app" {
  availability_zone = "eu-central-1b"
  ami                         = "ami-0ec7f9846da6b0f61"
  instance_type               = "t3.small"
  user_data                   = file("user-data.sh")
  user_data_replace_on_change = true
  key_name                    = "school-app"
  iam_instance_profile        = aws_iam_instance_profile.school-app-profile.name
  tags                        = {
    Name = "school-app"
  }
}

resource "aws_volume_attachment" "ebs_att" {
  # device_name = "/dev/nvme1n1"
  device_name = "/dev/sdh"
  volume_id   = aws_ebs_volume.school-app-persistent.id
  instance_id = aws_instance.school-app.id
}
