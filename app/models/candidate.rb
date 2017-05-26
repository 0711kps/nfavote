class Candidate < ApplicationRecord
  belongs_to :vote_event
  has_many :votes, :dependent => :destroy
  has_many :voters,:through => :votes, :dependent => :destroy
  validates_presence_of :name,:title,:unit # 候選人姓名、職稱、單位必填
end
