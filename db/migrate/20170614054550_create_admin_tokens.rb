class CreateAdminTokens < ActiveRecord::Migration[5.1]
  def change
    create_table :admin_tokens do |t|
      t.string :addr
      t.integer :admin_id

      t.timestamps
    end
  end
end
