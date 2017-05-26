class Admin::VotesController < ApplicationController
  before_action :ie_go_die, if: :is_ie?
  before_action :go_through_entry, if: :signin?, only: :entrance
  before_action :back_to_entry, if: :not_signin?, except: [:entrance, :valid]

  # 顯示後臺登入畫面
  def entrance;end

  # 驗證admin帳密
  def valid
    account,passwd = params[:account],params[:passwd]
    target_admin = Admin.validate account,passwd
    if target_admin
      session[:adtoken] = AdminToken.force_create target_admin,request.remote_ip
      render 'select',:layout => false
    else
      head 422
    end
  end

  # 登出
  def logout
    token=AdminToken.find_by_addr(request.remote_ip)
    if token.destroy
      render 'entrance', layout: false
    else
      head 500
    end
  end
  
  # 選擇權限或投票功能
  def select
    @step=2
  end

  # 主機資源監視器
  def sysrc_monitor
    @step=2
    @disk_usage=%x(df /dev/sda1 | grep sda1 | awk '{print $5}'|sed 's/%//').strip
    @ram_usage=%x(free | grep 'Mem' | awk '{print $3/$2*100}').to_i.to_s
    @cpu_usage=%x(top -bn1 | sed -n '/Cpu/p' | awk '{print $2}').to_i.to_s
    @files_count = %x(ls #{Rails.root.join("log")} | wc -l).to_i-2
  end

  # 下載log
  def download_log
    begin
      case params[:log_id]
      when "0000"
        send_file Rails.root.join('log','production.log'),filename: "latest.log"
      when /^\d{4}$/
        files_count = %x(ls #{Rails.root.join('log')} | wc -l).to_i - 2
        target_file = "logfile_"+%x(printf "%04d" #{files_count +1 - params[:log_id].to_i})+".log"
        send_file Rails.root.join('log',target_file),filename: "#{params[:log_id]}.log"
      else
        head 404
      end
    rescue
      head 404
    end
  end

  private

  # 將ie用戶從導向至別的頁面,勸導其更換瀏覽器
  def ie_go_die
    render file: "public/no_ie.html", layout: false
  end

  # 檢查瀏覽器是否爲ie
  def is_ie?
    return Browser.new(request.user_agent).ie?
  end

  # 將輸入的密碼SHA1加密後比對資料庫帳密是否有相對應記錄存在
  def can_pass? acc,pw
    pw = Digest::SHA1.hexdigest(pw)
    return Admin.exists? account: acc, passwd: pw
  end

  # 重導至後臺首頁
  def back_to_entry
    redirect_to '/admin'
  end
  
  # 檢查是否登入
  def signin?
    return AdminToken.where('addr = ? and expire_at >= ? and content = ?',request.remote_ip,Time.now,session[:adtoken]).any?
  end

  # 檢查是否登入，回傳反值
  def not_signin?
    return AdminToken.where('addr = ? and expire_at >= ? and content = ?',request.remote_ip,Time.now,session[:adtoken]).empty?
  end

  # 已登入則跳過登入畫面，直搗選擇畫面
  def go_through_entry
    redirect_to '/admin/select'
  end
end
