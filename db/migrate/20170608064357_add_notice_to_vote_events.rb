class AddNoticeToVoteEvents < ActiveRecord::Migration[5.1]
  def change
    add_column :vote_events, :notice, :string
  end
end
