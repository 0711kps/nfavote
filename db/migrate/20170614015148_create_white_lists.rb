class CreateWhiteLists < ActiveRecord::Migration[5.1]
  def change
    create_table :white_lists do |t|
      t.string :addr

      t.timestamps
    end
  end
end
