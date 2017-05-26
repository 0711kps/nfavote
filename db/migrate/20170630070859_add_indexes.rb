class AddIndexes < ActiveRecord::Migration[5.1]
  def change
    add_index :vote_events, :startline
    add_index :vote_events, :deadline
    add_index :vote_events, :created_at
    add_index :voters, :card_id
    add_index :votes, :candidate_id
    add_index :votes, :voter_id
  end
end
