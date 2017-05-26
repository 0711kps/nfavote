class Admin::PermissionsController < ApplicationController
  before_action :ie_go_die, if: :is_ie?
  before_action :back_to_entry, if: :not_signin?, only: :list
  before_action :no_permission_action, if: :not_signin?, only: [:create_admin, :del_admin]

  # 顯示管理者清單
  def list
    @admins = Admin.select(:account, :id).order("account ASC")
  end

  # 新增管理者至資料庫
  def create_admin
    Admin.create(account: params[:account], passwd: params[:passwd])
    @admins = Admin.select(:account).order("account ASC")
    render 'create_admin',layout: false
  end

  # 刪除管理者 
  def del_admin
    if params[:id].to_i == AdminToken.find_by_content(session[:adtoken]).admin_id
      head 423
    else
      unless Admin.destroy params[:id]
        head 500
      end
    end
  end

  private
  
  # 勸導ie用戶改瀏覽器
  def ie_go_die
    render file: "public/no_ie.html", layout: false
  end

  # 檢查是否爲ie
  def is_ie?
    return Browser.new(request.user_agent).ie?
  end

  # 沒有執行動作權限，返回422
  def no_permission_action
    head 422
  end

  # 回後臺首頁
  def back_to_entry
    redirect_to '/admin'
  end
  
  # 是否登入
  def signin?
    return AdminToken.where('addr = ? and expire_at >= ? and content = ?',request.remote_ip,Time.now,session[:adtoken]).any?
  end

  # 是否登入，回傳反值
  def not_signin?
    return AdminToken.where('addr = ? and expire_at >= ? and content = ?',request.remote_ip,Time.now,session[:adtoken]).empty?
  end
end
