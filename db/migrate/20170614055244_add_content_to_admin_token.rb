class AddContentToAdminToken < ActiveRecord::Migration[5.1]
  def change
    add_column :admin_tokens, :content, :string
  end
end
