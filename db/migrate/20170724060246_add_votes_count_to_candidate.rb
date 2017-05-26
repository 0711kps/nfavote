class AddVotesCountToCandidate < ActiveRecord::Migration[5.1]
  def change
    add_column :candidates, :votes_count, :integer, :default => 0

    Candidate.pluck(:id).each do |i|
      Candidate.reset_counters(i, :votes)
    end
  end
end
