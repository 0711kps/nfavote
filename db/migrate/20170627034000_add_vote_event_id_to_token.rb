class AddVoteEventIdToToken < ActiveRecord::Migration[5.1]
  def change
    add_column :tokens, :vote_event_id, :integer
  end
end
