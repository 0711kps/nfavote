class Admin < ApplicationRecord
  before_create :to_sha
  has_one :admin_token
  validates_presence_of :account, :passwd # 帳密必填
  validates_uniqueness_of :account # 帳號名稱不可重複

  def self.validate account,passwd
    find_admins=where(account: account,passwd: Digest::SHA1.hexdigest(passwd))
    (find_admins.any?)?(find_admins.first):(nil)
  end

  private
  # 新增管理者時將輸入的密碼轉換爲sha，以防登入資料庫可以直接看見
  def to_sha 
    self.passwd = Digest::SHA1.hexdigest(self.passwd)
  end
end
