class Admin::EventsController < ApplicationController
  before_action :ie_go_die, if: :is_ie?
  before_action :back_to_entry, if: :not_signin?, except: [:event_statistics, :del_event, :del_voter,:del_candidate, :create_event, :create_voter, :create_candidate]
  before_action :no_admin_permission, if: :not_signin?, only: [:event_statistics, :del_event, :del_voter, :del_candidate, :create_event, :create_voter, :create_candidate,:event_list, :del_event, :import_voter, :new_candidate, :create_candidate, :del_candidate, :import_candidate, :edit_info, :edit_voters, :edit_candidates]
  before_action :prevent_edit, unless: :is_incoming?, only: [:edit_info, :edit_voters, :edit_candidates]
  before_action :set_event, only: [:edit_info, :edit_voters, :edit_candidates, :update_info]

  # 後臺投票列表
  def event_list
    @events = VoteEvent.group_by_time
    render 'event_list', layout: false if request.xhr?
  end 

  # 投票結果
  def event_statistics
    @event = VoteEvent.find(params[:id])
    # 投票結束才能查看票數統計
    if !request.xhr?
      head 404
    elsif @event.is_over?
      @result = @event.candidates.select(:name, :votes_count).order("votes_count DESC")
      @max = @result.first.votes_count
      render 'event_statistics', layout: false
    else
      head 422
    end
  end

  # 新增投票，投票資訊
  def new_event
      render 'new_event', layout: false
  end

  # 新增投票資訊至資料庫
  def create_event
    event = params[:event]
    title = event['title']
    notice = event['notice']
    start = event['start']
    dead = event['dead']
    amount = event['amount']
    ve=VoteEvent.create(title: title, notice: notice, startline: Time.parse(start), deadline: Time.parse(dead), limit_amount: amount)
    head 500 if ve.id.nil?
    respond_to do |f|
      f.html
      f.json{render json: ve}
    end
  end

  # 顯示新增投票人的畫面
  def new_voter
    render 'new_voter', layout: false if request.xhr?
  end

  # 新增投票人至資料庫
  def create_voter
    if Voter.create(name: params[:name], card_id: params[:card], birthday: params[:birthday], vote_event_id: params[:evid]).valid?
      @voters = Voter.where(vote_event_id: params[:evid]).order("name ASC")
      render 'create_voter', layout: false
    else
      head 500
    end
  end

  # 匯入投票人
  def import_voter
    evid = params[:evid]
    people = params[:people].split(';')
    output = []
    people.each do |p|
      array = p.split("\t")
      if array.size > 3
        array.shift
      elsif array.size < 3
        next
      elsif array[0].index(/^[A-Z][\d]{9}$/).nil? # 不合法的身分證號
        next
      elsif !((2..4) === array[1].size) # 不對勁的姓名字數
        next
      elsif array[2].index(/^\d{6,7}$/) == -1
        next
      end
      output << Voter.new(name: array[1], card_id: array[0], birthday: array[2], vote_event_id: evid )
    end
    if output.size > 0
      Voter.import output
      @voters = Voter.where(vote_event_id: evid).order("name ASC")
      origin_count = VoteEvent.find(evid).voters_count
      VoteEvent.find(evid).update(voters_count: origin_count + output.size)
      render 'import_voter', layout: false
    end
  end

  # 候選人匯入
  def import_candidate
    evid = params[:evid]
    people=params[:people].split(';')
    output = []
    people.each do |p|
      array = p.split("\t")
      if array.size > 3
        array.shift
      elsif array.size < 3
        next
      elsif !((2..4) === array[0].size) # 不對勁的姓名字數
        next
      elsif !((2..15) === array[1].size) # 不對勁的單位名稱
        next
      elsif !((2..15) === array[2].size) #  不對勁的職稱
        next
      end
      output << Candidate.new(name: array[0], unit: array[1], title: array[2], vote_event_id: evid )
    end
    Candidate.import output
    @candidates = Candidate.where(vote_event_id: evid).order("unit ASC")
    render 'import_candidate', layout: false
  end

  # 刪除投票人
  def del_voter
    Voter.destroy params[:id]
  end

  # 新增候選人畫面
  def new_candidate
    render 'new_candidate', layout: false if request.xhr?
  end

  # 刪除投票
  def del_event
    unless VoteEvent.destroy params[:id]
      head 500
    end
  end

  # 編輯投票資訊
  def edit_info
    if request.xhr?
      render "edit_info", layout: false
    else
      head 500
    end
  end

  # 編輯投票人清單
  def edit_voters
    if request.xhr?
      @voters = @event.voters
      render "edit_voters", layout: false
    else
      head 500
    end
  end

  # 編輯候選人清單
  def edit_candidates
    if request.xhr?
      @candidates = @event.candidates
      render "edit_candidates", layout: false
    else
      head 500
    end
  end

  # 將投票資訊的更新應用到資料庫
  def update_info
    if params[:start]
      start = Time.parse(params[:start])
    else
      start = @event.startline
    end
    if params[:dead]
      dead = Time.parse(params[:dead])
    else
      dead = @event.deadline
    end
    title = params[:title]||@event.title
    amount = params[:amount]||@event.limit_amount
    notice = params[:notice]||@event.notice
    if start >= dead
      head 500
    else
      @event.update(limit_amount: amount, title: title, notice: params[:notice]||=@event.notice, startline: start, deadline: dead)
    end
  end

  # 新增候選人至資料庫
  def create_candidate
    VoteEvent.find(params[:evid]).candidates.create(name: params[:name], unit: params[:unit], title: params[:title])
    @candidates = Candidate.where(vote_event_id: params[:evid]).order("unit ASC")
    render 'create_candidate', layout: false
  end

  # 刪除候選人
  def del_candidate
    unless Candidate.destroy params[:id]
      head 500
    end
  end

  private

  # ie導向至勸導頁面
  def ie_go_die
    render file: "public/no_ie.html", layout: false
  end

  # 檢查是否爲ie
  def is_ie?
    return Browser.new(request.user_agent).ie?
  end

  # 檢查投票是否爲「尚未開始」
  def is_incoming?
    return VoteEvent.find(params[:id]).startline>Time.now
  end

  # 進行中或已結束的投票不允許編輯
  def prevent_edit
    head 423
  end

  # 執行動作但不具備管理者權限則返回錯誤訊號
  def no_admin_permission
    head 422 if request.xhr?
  end

  # 重導至後臺入口
  def back_to_entry
    unless request.xhr?
      redirect_to '/admin'
    end
  end
  
  # 是否登入
  def signin?
    return AdminToken.where('addr = ? and expire_at >= ? and content = ?',request.remote_ip,Time.now,session[:adtoken]).any?
  end

  # 是否登入（反值）
  def not_signin?
    return AdminToken.where('addr = ? and expire_at >= ? and content = ?',request.remote_ip,Time.now,session[:adtoken]).empty?
  end

  # 根據id抓出投票
  def set_event
    @event = VoteEvent.find(params[:id])
  end

  # 已登入，則導向至選擇功能頁面
  def go_through_entry
    if request.xhr?
      render 'select', layout: false
    else
      redirect_to '/admin/select'
    end
  end
end
