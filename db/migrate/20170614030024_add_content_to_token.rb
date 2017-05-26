class AddContentToToken < ActiveRecord::Migration[5.1]
  def change
    add_column :tokens, :content, :string
  end
end
