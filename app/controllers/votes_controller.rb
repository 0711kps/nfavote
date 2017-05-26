class VotesController < ApplicationController
  before_action :ie_go_die, if: :is_ie?
  before_action :rd_no_event, unless: :has_event?, only: :entrance
  before_action :rd_root, if: :has_event?, only: :no_event
  before_action :no_permission_action, if: :not_signin?, only: [:logout, :vote]
  before_action :remove_all_token, unless: :has_event?
  before_action :current_event, only: [:signin_form, :validate, :candidates, :vote, :thx]
  before_action :current_voter, only: [:vote, :candidates]
  before_action :set_event_param, only: [:signin_form, :candidates, :thx]
  def entrance
    # 顯示除了已經結束的投票列表，對應xhr無layout
    @events = VoteEvent.group_by_time
    if request.xhr?
      render 'entrance', layout: false
    end
  end

  def signin_form
    # 顯示登入的表單，但不允許直接GET網址
    request.xhr??render('signin_form',layout: false):head(404)
  end

  def validate # 前臺登入
    # 檢查帳密，給予登入token
    account,passwd = params[:account],params[:passwd]
    target_voter=Voter.validate @current_event,account,passwd
    if target_voter
      session[:token] = Token.force_create @current_event,target_voter,request.remote_ip
      @vote_title = @current_event.title
      @voter_name = target_voter.name
      if already_vote? @current_event,target_voter
        @deadline = @current_event.deadline
        render "thx", layout:false
      else
        @candidates = @current_event.candidates.order("unit ASC")
        @vote_id = @current_event.id
        render "candidates", layout: false, id: @vote_id
      end
    else
      head 422
    end
  end

  # 顯示候選人名單
  def candidates;end

  # 送出投票
  def vote
    # vote_targets->所選的候選人之id
    vote_targets = params[:vote_targets]
    vote_targets.each do |vt|
      @current_voter.votes.create(candidate_id: vt, vote_event: @current_event)
    end
    @deadline = @current_event.deadline
    @vote_title = @current_event.title
    render 'thx', layout: false
  end

  # 登出
  def logout
    # 找到對應的token，將其刪除
    Token.find_by(addr: request.remote_ip,content: session[:token]).destroy
    @events = VoteEvent.group_by_time
    session[:token]=nil
    render "entrance", layout: false
  end

  def thx
    if request.xhr?
      @deadline = @current_event.deadline
      render 'thx', layout: false
    else
      head 404
    end
  end

  # 顯示"沒有可參與的投票"的頁面
  def no_event;end

  private

  # 若爲IE轉址至特別的頁面,接著is_ie?用
  def ie_go_die
    render file: "public/no_ie.html", layout: false
  end

  # 透過browser這個gem,分析user_agent並判斷是何種瀏覽器
  def is_ie?
    Browser.new(request.user_agent).ie?
  end

  # 沒有token卻執行操作，回傳422(在前臺會重導向至入口)
  def no_permission_action
    head 422 if request.xhr?
  end

  # 設定投票id與投票title
  def set_event_param
    @vote_id = params[:id]
    @vote_title = VoteEvent.find(params[:id]).title
  end
  
  # 重導向至"無可參與投票"頁面
  def rd_no_event
    redirect_to '/no_event'
  end

  # 重導向至入口
  def rd_root
    redirect_to '/'
  end

  # 檢查有無合法token
  def signin?
    Token.where("addr = ? and expire_at >= ? and content = ?",request.remote_ip,Time.now,session[:token]).any?
  end

  # 檢查有無合法token(回傳相反的值)
  def not_signin?
    Token.where('addr = ? and expire_at >= ? and content = ?',request.remote_ip,Time.now,session[:token]).empty?
  end

  # 根據傳入id設定現在的投票
  def current_event
    begin
      @current_event = VoteEvent.find(params[:id])
    rescue
      head 404
    end
  end

  # 檢查有無可參與投票
  def has_event?
    return VoteEvent.available_events.any?
  end

  # 根據token與投票設定現在的投票人
  def current_voter
    @current_voter = Token.find_by(addr: request.remote_ip, vote_event: @current_event).voter
  end

  # 檢查"現在投票人" 是否已經對 "現在的活動"投過票
  def already_vote? event,voter
    return Vote.where(vote_event: event,voter: voter).any?
  end

  # 檢查"現在投票人" 是否已經對 "現在的活動"投過票(回傳相反值)
  def not_vote_yet?
    return Vote.where(vote_event: event,voter: voter).empty?
  end

  # 移除所有token
  def remove_all_token
    Token.delete_all
  end
end
