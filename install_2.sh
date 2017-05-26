# plz run source ~/.bashrc in the terminal manually before this script
cd
sudo `which passenger-install-nginx-module` # select 1 and default
rails new nfavote -BMCsq --skip-coffee --skip-turbolinks --no-dev
cd nfavote/
bundle
railssecret=`rails secret`
tmp_msg=`head -n -1 config/secrets.yml`
rm -f log/development.log
echo "$tmp_msg" > config/secrets.yml
echo "  secret_key_base: $railssecret" >> config/secrets.yml
RAILS_ENV=production rails db:migrate
RAILS_ENV=production rails db:seed
rails assets:precompile
rm 'app/views/layouts/application.html.erb' &
rm 'public/apple*.png' &
sudo rm '/opt/nginx/conf/nginx.conf'
sudo cp 'nginx.conf' '/opt/nginx/conf/'
sudo systemctl daemon-reload
sudo systemctl enable nfavote
sudo systemctl start nfavote
echo "19 * * * * /bin/bash /home/$USER/nfavote/take_care_log.sh" > mycron
sudo crontab mycron
rm mycron
