resource "aws_iam_policy" "s3-iam-policy" {
  name        = "AmazonS3SchoolAppBucketFullAccess"
  description = "Provides permission to full access S3 puzzle-shop bucket"
  policy      = jsonencode({
    Version   = "2012-10-17"
    Statement = [
      {
        Action = [
          "s3:DeleteObjects",
          "s3:PutObject",
          "s3:ListObjects"
        ]
        Effect   = "Allow"
        Resource = ["arn:aws:s3:::school-app-19482/*"]
      },
    ]
  })
}

resource "aws_iam_policy" "ssm-iam-policy" {
  name        = "AmazonSSMFullAccess"
  description = "Provides permission to full access SSM parameters"
  policy      = jsonencode({
    Version   = "2012-10-17"
    Statement = [
      {
        "Effect" : "Allow",
        "Action" : [
          "ssm:GetParameters",
          "ssm:GetParameter"
        ],
        "Resource" : "arn:aws:ssm:eu-central-1:371395915547:parameter/*"
      },
    ]
  })
}

resource "aws_iam_role" "school-app-iam-role" {
  name               = "school-app-iam-role"
  assume_role_policy = jsonencode({
    Version   = "2012-10-17"
    Statement = [
      {
        Action    = "sts:AssumeRole"
        Effect    = "Allow"
        Sid       = "RoleForEC2"
        Principal = {
          Service = "ec2.amazonaws.com"
        }
      },
    ]
  })
}

resource "aws_iam_policy_attachment" "s3-iam-policy-attachment" {
  name       = "s3-iam-policy-attachment"
  roles      = [aws_iam_role.school-app-iam-role.name]
  policy_arn = aws_iam_policy.s3-iam-policy.arn
}

resource "aws_iam_policy_attachment" "ssm-iam-policy-attachment" {
  name       = "ssm-iam-policy-attachment"
  roles      = [aws_iam_role.school-app-iam-role.name]
  policy_arn = aws_iam_policy.ssm-iam-policy.arn
}

resource "aws_iam_instance_profile" "school-app-profile" {
  name = "school-app-profile"
  role = aws_iam_role.school-app-iam-role.name
}
