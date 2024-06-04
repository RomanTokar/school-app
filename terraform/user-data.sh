#!/bin/bash

set -x

lsblk

if sudo file -s /dev/nvme1n1; then
  if [ ! "$(sudo file -s /dev/nvme1n1)" = "/dev/nvme1n1: data" ]; then
    echo "Volume already formatted. Skipping mkfs."
  else
    sudo mkfs -t ext4 /dev/nvme1n1
  fi
fi


sudo mkdir /mnt/app-persistent
sudo mount /dev/nvme1n1 /mnt/app-persistent

sudo mkdir -p /mnt/app-persistent/letsencrypt/etc/letsencrypt
sudo mkdir -p /mnt/app-persistent/letsencrypt/var/log/letsencrypt
sudo mkdir -p /mnt/app-persistent/letsencrypt/var/lib/letsencrypt/

sudo mkdir -p /etc/letsencrypt
sudo mkdir -p /var/log/letsencrypt
sudo mkdir -p /var/lib/letsencrypt/

sudo mount --bind \
  /mnt/app-persistent/letsencrypt/etc/letsencrypt \
  /etc/letsencrypt
sudo mount --bind \
  /mnt/app-persistent/letsencrypt/var/log/letsencrypt \
  /var/log/letsencrypt/
sudo mount --bind \
  /mnt/app-persistent/letsencrypt/var/lib/letsencrypt/ \
  /var/lib/letsencrypt/

sudo apt update -y
sudo apt install git -y
sudo apt install python3 -y
sudo apt install python3-pip -y
sudo apt install awscli -y
sudo apt install certbot -y

if ! git clone https://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@github.com/ThisIsSoftwaredevv/school-app.git; then
  echo "GIT CLONE IS INVALID!!! Using a tempory workaround..."
  cp -a /var/log/letsencrypt/chris-backup/school-app school-app
fi

cd school-app

aws ssm get-parameters --names "MONGODB_URI" "PORT" "S3_BUCKET_NAME" "S3_BUCKET_REGION" "JWT_SECRET" "JWT_EXPIRES_IN" --region eu-central-1 --output text --query "Parameters[*][Name,Value]" |
  while read line; do
    echo "$line" | awk -F'\t' '{print $1"="$2}' >>app/server/.env
  done

sudo cat << EOF > app/web-app/.env
REACT_APP_BASE_URL="/api"
EOF

# nginx setting domain 
domainName=$(aws ssm get-parameter --name "DOMAIN_NAME" --query "Parameter.Value"  --region eu-central-1 --output text)

if [ $? -eq 0 ] && [ -n "$domainName" ]; then
  echo "Domain name set from AWS SSM: $domainName"
else
  domainName="app.etgarmadaim.com"
  echo "Using default domain: app.etgarmadaim.com"
fi

sed -i "s|/etc/letsencrypt/live/example.com/|/etc/letsencrypt/live/${domainName}/|g" nginx/default.conf

# docker
sudo apt install apt-transport-https ca-certificates curl software-properties-common -y
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo apt-key add -
sudo add-apt-repository "deb [arch=amd64] https://download.docker.com/linux/ubuntu focal stable" -y
apt-cache policy docker-ce
sudo apt install docker-ce -y

#docker-compose
sudo curl -L "https://github.com/docker/compose/releases/download/1.29.2/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# certbot renew certs, otherwise get certs if it does not exist
if ! sudo certbot renew | grep "Certificate not yet due for renewal"; then
  sudo certbot certonly --non-interactive --agree-tos -m etgar57@gmail.com --standalone --preferred-challenges http -d "$domainName"
fi

# certbot
sudo mkdir -p /var/www/letsencrypt/

# add daily cron to try renew certs
renewHook="sudo docker exec nginx-proxy nginx -s reload"
#(crontab -l ; echo "38 3 * * * sudo certbot renew --renew-hook \"$renewHook\" --webroot -w /var/www/letsencrypt") | crontab -
cronCmd="38 3 * * * sudo certbot renew --renew-hook \"$renewHook\" --webroot -w /var/www/letsencrypt"
if crontab -l; then
  (crontab -l ; echo "$cronCmd") | crontab -
else
  echo "$cronCmd" | crontab -
fi


docker-compose up --build
