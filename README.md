# 消防署投票網(主要爲內部使用)
## 作業系統
* Debian 9
## 軟體版本
* Ruby: 2.4.2
* Rails: 5.1.4
* mariadb(從原mysql5.7 fork出來): 10.1
* passenger 5.1.11
## 安裝方式
1. 安裝Debian(或任何其他Linux Distribution，若非Debian安裝package部分可能與教學有異)
2. 安裝git  
`su -c "apt-get install git"`
3. 從NFAVOTE來源複製原始碼  
`git clone https://github.com/0711kps/nfavote`
4. 執行第一個安裝腳本  
`bash install_1.sh`
5. 重新讀取bashrc file(這一步咯過將導致執行錯誤)
`source ~/.bashrc`
6. 執行第二個安裝腳本  
`bash install_2.sh`
7. 現在輸入你的IP就能訪問網站  
![](http://i.imgur.com/QTJPe1l.png)
