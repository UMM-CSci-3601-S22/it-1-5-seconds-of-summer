#!/usr/bin/env bash
if [[ ! -e /swapfile ]]; then
  echo "/swapfile does not exist, setting up swap"
  # Set up swap space
  fallocate -l 3G /swapfile
  chmod 600 /swapfile
  mkswap /swapfile
  swapon /swapfile
  echo '/swapfile none swap sw 0 0' | tee -a /etc/fstab
  echo 'vm.swappiness=10' >> /etc/sysctl.conf
else
  echo "/swapfile already exists, skipping swap setup"
fi

ip="$(curl -s http://169.254.169.254/metadata/v1/interfaces/public/0/ipv4/address)"
domain="${ip}.nip.io"

echo
echo "Setting APP_HOST to ${domain}"
echo "APP_HOST=${domain}" > .env
echo
echo "Your site will be served over HTTPS automatically using Let's Encrypt or ZeroSSL."
echo "By continuing, you agree to the Let's Encrypt Subscriber Agreement at:"
echo "https://letsencrypt.org/documents/2017.11.15-LE-SA-v1.2.pdf"
echo "as well as the ZeroSSL Terms of Service at:"
echo "https://zerossl.com/terms/"
echo
echo "Please enter your email address to signify agreement and to be notified"
echo "in case of issues."
read -p "Email address: " email
echo
if [ -z "$email" ]; then
  echo "No email entered; not setting APP_CADDY_GLOBAL_OPTIONS"
else
  echo "Setting APP_CADDY_GLOBAL_OPTIONS to \"email ${email}\""
  echo "APP_CADDY_GLOBAL_OPTIONS=\"email ${email}\"" >> .env
fi
echo
echo "Your server is set up."
echo "Once you start it with 'docker-compose up -d' it will be available at:"
echo "https://${domain}"
echo "You should copy this down somewhere."
