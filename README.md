## Before you start

1. Add .env file in app/server according to the .env.example

## Installation

```bash
$ pnpm install
```

## Running the app

```bash
# it will start both FE and BE in development mode with watch feature
$ pnpm run dev
```

## Admin credentials
```bash
abc@de.com
12345678
```


## Deployment

```bash
cd terraform
terraform init
terraform plan
terraform apply --auto-approve --replace=aws_instance.school-app
```

Once the instance starts the first time it'll run the terraform/user-data.sh script, and a log of this will be stored in `/var/log/cloud-init-output.log`.

The `school-app-persistent-volume` ebs volume will be mounted on the instance, and this is how it stores the SSL (via Letsencrypt). This is required because otherwise a rate limit will be exceeded when we try to get a certificate (during a depoly) more than 5 times during a week (https://letsencrypt.org/docs/rate-limits/).

## Nginx / Letsencrypt / SSL

Lets encrypt is installed on the host.

Letsencrypt stores all it's info in `/etc/letsencrypt`, `/var/lib/letsencrypt/` and `/var/log/letsencrypt`. This is what is persisted in the `school-app-persistent-volume` ebs volume.

So to get this availble to nginx container we mount `/etc/letsencrypt:/etc/letsencrypt`.

In order to do the acme challenge for letsencrypt, we also mount the webroot `/var/www/letsencrypt/:/var/www/letsencrypt/` in the nginx container. And there is of coures a nginx location config for this:

```
  location ^~ /.well-known/acme-challenge/ {
    root /var/www/letsencrypt/;
    try_files $uri =404;
  }
```

And finally we have a cron setup to do the renewal. This gets checked everyday, but only tries to retrieve certs if they are due for renewal. 
