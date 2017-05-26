class DropWhiteList < ActiveRecord::Migration[5.1]
  def change
    drop_table :white_lists
  end
end
