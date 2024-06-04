resource "aws_eip" "eip" {
  vpc =  true
}

resource "aws_eip_association" "eip_assoc" {
  instance_id   = aws_instance.school-app.id
  allocation_id = aws_eip.eip.id
}
