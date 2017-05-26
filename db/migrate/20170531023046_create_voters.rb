class CreateVoters < ActiveRecord::Migration[5.1]
  def change
    create_table :voters do |t|
      t.string :card_id
      t.string :birthday
      t.string :name
      t.integer :vote_event_id

      t.timestamps
    end
  end
end
