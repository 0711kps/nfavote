class CreateTokens < ActiveRecord::Migration[5.1]
  def change
    create_table :tokens do |t|
      t.string :addr
      t.integer :voter_id
      t.datetime :expire_at

      t.timestamps
    end
  end
end
