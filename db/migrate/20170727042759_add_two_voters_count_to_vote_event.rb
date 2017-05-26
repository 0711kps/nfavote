class AddTwoVotersCountToVoteEvent < ActiveRecord::Migration[5.1]
  def change
    add_column :vote_events, :voters_count, :integer, default: 0
    add_column :vote_events, :voted_count, :integer, default: 0
  end
end
