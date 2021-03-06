class Token < ApplicationRecord
  belongs_to :voter
  belongs_to :vote_event
  before_create :set_expired_time, :random_token
  before_save :set_expired_time, :random_token
  before_update :set_expired_time, :random_token

  def self.force_create event,voter,addr
    info = { vote_event: event, voter: voter }
    target = find_by info
    if target.present?
      target.update! addr: addr
    else
      new_info = info.merge addr: addr
      target = new(new_info)
      target.save!
    end
    target.content
  end

  private

  def set_expired_time
    self.expire_at = Time.now+30.minute
  end

  def random_token
    self.content = SecureRandom.hex
  end
end
