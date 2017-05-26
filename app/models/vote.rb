class Vote < ApplicationRecord
  belongs_to :candidate, counter_cache: true
  belongs_to :voter
  belongs_to :vote_event
  validate :legal_amount, :same_event, on: :create
  validates_uniqueness_of :candidate_id, scope: :voter_id # 同一投票者不可投複數票給同一候選人
  after_create :update_counter

  def legal_amount # 數量不能超過event的限制人數,不能投給同一人多票
    errors.add(:voter_id,"too much vote for a voter") if voter.votes.count >= vote_event.limit_amount
  end

  def same_event
    errors.add(:voter_id,"doesnt belongs to the same event with candidate") if vote_event_id != candidate.vote_event_id
  end

  def update_counter
    new_counter = vote_event.recount_voted
  end
end
