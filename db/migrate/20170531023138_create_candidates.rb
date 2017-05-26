class CreateCandidates < ActiveRecord::Migration[5.1]
  def change
    create_table :candidates do |t|
      t.string :name
      t.string :title
      t.string :unit
      t.integer :vote_event_id
    end
  end
end
