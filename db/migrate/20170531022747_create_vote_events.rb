class CreateVoteEvents < ActiveRecord::Migration[5.1]
  def change
    create_table :vote_events do |t|
      t.integer :limit_amount
      t.datetime :startline
      t.datetime :deadline

      t.timestamps
    end
  end
end
