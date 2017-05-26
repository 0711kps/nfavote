class VoteEvent < ApplicationRecord
  has_many :candidates, :dependent => :delete_all
  has_many :voters, :dependent => :delete_all
  has_many :votes, :dependent => :delete_all
  has_many :tokens, :dependent => :delete_all
  # 投票活動標題、票選人數、開始、結束時間必填
  validates_presence_of :title, :limit_amount, :startline, :deadline
  # 驗證時間、票選人數是否合理
  validate :dead_in_future,:legal_amount,:no_instant_event,:start_and_dead,on: :create 

  def self.available_events
    where("deadline > ?",Time.now).order("startline ASC")
  end 

  def left_time
    if startline <= Time.now && deadline > Time.now # 進行中
      if (Time.now - deadline).to_i.abs < 60
        "投票即將結束"
      else
        lt = (Time.now - deadline).to_i.abs
        lt_day = lt / 86400
        lt_hour = lt % 86400 / 3600
        lt_min = lt % 86400 % 3600 / 60
        "還有#{lt_day.to_s + "天" if lt_day != 0}#{lt_hour.to_s + "小時" if lt_hour != 0}#{lt_min.to_s + "分鐘" if lt_min != 0}"
      end
    elsif startline > Time.now # 還沒開始
      if (Time.now - startline).to_i.abs < 60
        "投票即將開始"
      else
        lt = (Time.now - startline).to_i.abs
        lt_day = lt / 86400
        lt_hour = lt % 86400 / 3600
        lt_min = lt % 86400 % 3600 / 60
        "將於#{lt_day.to_s + "天" if lt_day != 0}#{lt_hour.to_s + "小時" if lt_hour != 0}#{lt_min.to_s + "分鐘" if lt_min != 0}後開始"
      end
    end
  end

  def make_incoming
    update startline: Time.now+8.hour, deadline: Time.now+16.hour
  end

  def make_current
    update startline: Time.now, deadline: Time.now+1.hour
  end

  def make_over
    update startline: Time.now-8.hour, deadline: Time.now
  end

  def recount_voted
    new_count = votes.group(:voter_id).count.count
    update voted_count: new_count
  end

  def random_vote
    output = []
    vids = voters.pluck(:id)
    cids = candidates.pluck(:id)
    vids.each do |voter|
      limit_amount.times do
        output << votes.new(voter_id: voter, candidate_id: cids.sample)
      end
    end
    Vote.import output
    Candidate.pluck(:id).each do |c|
      Candidate.reset_counters(c, :votes)
    end
    VoteEvent.find(id).update(voted_count: votes.group(:voter_id).count.count)
  end 

  def is_over?
    deadline<=Time.now
  end

  def self.group_by_time
    events = { incoming: [],current: [],ended: [] }
    order('created_at').each do |ev|
      if ev.startline > Time.now # 未開始
        events[:incoming] << ev
      elsif ev.deadline <= Time.now  # 已結束
        events[:ended] << ev
      else  # 進行中
        events[:current] << ev
      end
    end
    events
  end

  private

  def dead_in_future # 不能新增「已經結束的事件」
    errors.add(:deadline,"can't be in the past") if deadline < Time.now
  end

  def no_instant_event # 不能新增「早就開始的事件」
    errors.add(:startline,"can't be an already active event") if startline <= Time.now
  end

  def legal_amount # 當選人數須爲正整數
    errors.add(:limit_amount,"should be a positive integer") if limit_amount < 1
  end

  def start_and_dead # 起始時間不可晚於結束時間
    errors.add(:deadline,"time error, start is after dead") if deadline <= startline
  end
end
