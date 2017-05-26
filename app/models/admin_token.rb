class AdminToken < ApplicationRecord
  belongs_to :admin
  before_create :set_expired_time, :random_token
  before_save :set_expired_time, :random_token

  def self.force_create admin,addr
    info = { admin: admin, addr: addr }
    target = find_by info
    if target.present?
      target.update! addr: addr
    else
      target = new(info)
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
