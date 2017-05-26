class Voter < ApplicationRecord
  belongs_to :vote_event
  has_one :token
  has_many :votes,:dependent => :destroy
  has_many :candidates,:through => :votes,:dependent => :destroy
  validates_presence_of :card_id, :birthday, :name # 身分證、生日、姓名必填
  validates_format_of :card_id,with: /\A[a-z]\d{9}\z/i # 檢查身分證格式
  validates_format_of :birthday,with: /\A\d{2,3}(0[1-9]|1[0-2])(0[1-9]|[12][0-9]|3[01])\z/ # 檢查生日格式
  validates_length_of :name, in: 2..4 # 姓名字數驗證
  validates_uniqueness_of :card_id, scope: :vote_event_id # 同一投票中不允許重複投票人出現
  after_create :counter_plus
  after_destroy :counter_minus

  def self.validate event,account,passwd
    find_voters=where(vote_event: event,card_id: account,birthday: passwd)
    (find_voters.any?)?(find_voters.first):(nil)
  end

  def counter_plus
    origin_count = vote_event.voters_count
    vote_event.update(voters_count: origin_count + 1)
  end

  def counter_minus
    origin_count = vote_event.voters_count
    vote_event.update(voters_count: origin_count - 1)
  end
end
