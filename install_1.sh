#run after install git at normal user
git config --global user.email "0711kps@gmail.com" &
git config --global user.name "Donny Hsieh" &
usrname=$USER
usraddr=`hostname -i`
sed -i "s/\[:username]/$usrname/g" ~/nfavote/nfavote.service &
sed -i "s/\[:server_ip]/$usraddr/g" ~/nfavote/nfavote.service &
sed -i "s/\[:usrname]/$usrname/g" ~/nfavote/take_care_log.sh &
echo "alias grep='grep --color'"  >> ~/.bashrc &
echo "alias agi='sudo apt install'"  >> ~/.bashrc &
echo "alias agr='sudo apt remove'"  >> ~/.bashrc &
echo "alias agug='sudo apt upgrade'"  >> ~/.bashrc &
echo "alias agdug='sudo apt dist-upgrade'"  >> ~/.bashrc &
echo "alias agc='sudo apt clean'"  >> ~/.bashrc &
echo "alias agud='sudo apt update'"  >> ~/.bashrc &
echo "alias rap='rails assets:precompile'"  >> ~/.bashrc &
echo "alias psgs='passenger start'"  >> ~/.bashrc &
echo "alias psgsr='sudo \`which passenger\` start -e production --port 80'"  >> ~/.bashrc &
echo "alias rc='rails console'"  >> ~/.bashrc &
echo "alias rcp='rails console -e production'"  >> ~/.bashrc &
echo "alias rdm='rails db:migrate'" >> ~/.bashrc &
echo "alias rdmp='RAILS_ENV=production rails db:migrate'" >> ~/.bashrc &
echo "alias rds='rails db:seed'" >> ~/.bashrc &
echo "alias rdsp='RAILS_ENV=production rails db:seed'" >> ~/.bashrc &
echo "alias rg='rails generate'" >> ~/.bashrc &
echo "alias gst='git status'" >> ~/.bashrc &
echo "alias gps='git push'" >> ~/.bashrc &
echo "alias gpl='git pull'" >> ~/.bashrc &
echo "alias gaa='git add .'" >> ~/.bashrc &
echo "alias gau='git add -u'" >> ~/.bashrc &
echo "alias gcm='git commit -m'" >> ~/.bashrc &
echo "alias glg='git log'" >> ~/.bashrc &
echo "alias gi='gem install'" >> ~/.bashrc &
echo "alias gu='gem uninstall'" >> ~/.bashrc &
wait
su -c "
  apt clean
  apt update
  apt install -y --no-install-recommends sudo wget curl build-essential libssl-dev libreadline-dev zlib1g-dev imagemagick libmariadbclient-dev libsqlite3-dev libcurl4-openssl-dev nodejs mariadb-server vim bc
  apt install -f -y
  apt remove -y --purge firefox-esr gnome-software mpv mplayer totem nano
  apt -y autoremove
  apt -y  dist-upgrade
  sed -i \"/root\t/a$usrname\tALL=(ALL:ALL) ALL\" /etc/sudoers
  cp '/home/$usrname/nfavote/nfavote.service' /etc/systemd/system/
  mysql --execute=\"create database nfavote CHARACTER set utf8 COLLATE utf8_general_ci;create user 'nfavote'@'localhost' identified by 'nfavote4129889';grant all privileges on *.* to 'nfavote'@'localhost';flush privileges\"
"
git clone https://github.com/rbenv/rbenv.git ~/.rbenv
cd ~/.rbenv && src/configure && make -C src && cd
git clone https://github.com/rbenv/ruby-build.git ~/.rbenv/plugins/ruby-build
echo 'export PATH="$HOME/.rbenv/bin:$PATH"' >> ~/.bashrc
echo 'eval "$(rbenv init -)"' >> ~/.bashrc
ruby_version='2.4.1'
rails_version='5.1.0'
passenger_version="5.1.6"
.rbenv/bin/rbenv install "$ruby_version"
.rbenv/bin/rbenv global "$ruby_version"
.rbenv/bin/rbenv local "$ruby_version"
.rbenv/versions/"$ruby_version"/bin/gem install rails -v $rails_version &
.rbenv/versions/"$ruby_version"/bin/gem install passenger -v $passenger_version &
wait
