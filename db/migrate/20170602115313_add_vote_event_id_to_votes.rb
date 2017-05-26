class AddVoteEventIdToVotes < ActiveRecord::Migration[5.1]
  def change
    add_column :votes, :vote_event_id, :integer
  end
end
