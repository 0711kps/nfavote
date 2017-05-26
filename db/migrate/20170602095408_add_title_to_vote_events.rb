class AddTitleToVoteEvents < ActiveRecord::Migration[5.1]
  def change
    add_column :vote_events, :title, :string
  end
end
