class AddEmailVerifiedAndNameAndImageToUsers < ActiveRecord::Migration[8.0]
  def change
    add_column :users, :email_verified, :boolean, default: false, null: false
    add_column :users, :image, :text
    add_column :users, :name, :text
  end
end

