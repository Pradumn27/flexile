class CreateAuthTables < ActiveRecord::Migration[8.0]
  def change
    create_table :session do |t|
      t.bigint :id, primary_key: true
      t.timestamp :expires_at, null: false
      t.text :token, null: false
      t.timestamp :created_at, null: false
      t.timestamp :updated_at, null: false
      t.text :ip_address
      t.text :user_agent
      t.bigint :user_id, null: false
      t.text :jwt

      t.index [:token], unique: true
      t.foreign_key :users, column: :user_id, on_delete: :cascade
    end

    create_table :account do |t|
      t.bigint :id, primary_key: true
      t.text :account_id, null: false
      t.text :provider_id, null: false
      t.bigint :user_id, null: false
      t.text :access_token
      t.text :refresh_token
      t.text :id_token
      t.timestamp :access_token_expires_at
      t.timestamp :refresh_token_expires_at
      t.text :scope
      t.text :password
      t.timestamp :created_at, null: false
      t.timestamp :updated_at, null: false

      t.foreign_key :users, column: :user_id, on_delete: :cascade
    end

    create_table :verification do |t|
      t.bigint :id, primary_key: true
      t.text :identifier, null: false
      t.text :value, null: false
      t.timestamp :expires_at, null: false
      t.timestamp :created_at, null: false
      t.timestamp :updated_at, null: false
    end
  end
end

