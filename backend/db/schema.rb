# This file is auto-generated from the current state of the database. Instead
# of editing this file, please use the migrations feature of Active Record to
# incrementally modify your database, and then regenerate this schema definition.
#
# This file is the source Rails uses to define your schema when running `bin/rails
# db:schema:load`. When creating a new database, `bin/rails db:schema:load` tends to
# be faster and is potentially less error prone than running all of your
# migrations from scratch. Old migrations may fail to apply correctly if those
# migrations use external dependencies or application code.
#
# It's strongly recommended that you check this file into your version control system.

ActiveRecord::Schema[7.1].define(version: 2026_03_24_013154) do
  # These are extensions that must be enabled in order to support this database
  enable_extension "plpgsql"

  create_table "jwt_denylist", force: :cascade do |t|
    t.string "jti", null: false
    t.datetime "exp", null: false
    t.index ["jti"], name: "index_jwt_denylist_on_jti"
  end

  create_table "refresh_tokens", force: :cascade do |t|
    t.bigint "user_id", null: false
    t.string "token", null: false
    t.datetime "expires_at", null: false
    t.datetime "revoked_at"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["token"], name: "index_refresh_tokens_on_token", unique: true
    t.index ["user_id"], name: "index_refresh_tokens_on_user_id"
  end

  create_table "study_sessions", force: :cascade do |t|
    t.bigint "topic_id", null: false
    t.date "scheduled_date", null: false
    t.integer "expected_minutes", default: 30, null: false
    t.integer "actual_minutes"
    t.integer "questions_done", default: 0, null: false
    t.integer "questions_correct", default: 0, null: false
    t.string "status", default: "scheduled", null: false
    t.boolean "auto_generated", default: false, null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.time "start_time"
    t.index ["topic_id", "scheduled_date"], name: "index_study_sessions_on_topic_id_and_scheduled_date"
    t.index ["topic_id"], name: "index_study_sessions_on_topic_id"
  end

  create_table "subjects", force: :cascade do |t|
    t.bigint "user_id", null: false
    t.string "name", limit: 100, null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["user_id"], name: "index_subjects_on_user_id"
  end

  create_table "topics", force: :cascade do |t|
    t.bigint "subject_id", null: false
    t.string "name", limit: 100, null: false
    t.text "notes"
    t.float "ease_factor", default: 2.5, null: false
    t.integer "interval", default: 1, null: false
    t.date "next_review", null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["subject_id"], name: "index_topics_on_subject_id"
  end

  create_table "user_configs", force: :cascade do |t|
    t.bigint "user_id", null: false
    t.string "available_days", default: ["mon", "tue", "wed", "thu", "fri"], array: true
    t.string "schedule_strategy", default: "sm2", null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["user_id"], name: "index_user_configs_on_user_id", unique: true
  end

  create_table "users", force: :cascade do |t|
    t.string "name", default: "", null: false
    t.string "email", default: "", null: false
    t.string "encrypted_password", default: "", null: false
    t.string "reset_password_token"
    t.datetime "reset_password_sent_at"
    t.datetime "remember_created_at"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["email"], name: "index_users_on_email", unique: true
    t.index ["reset_password_token"], name: "index_users_on_reset_password_token", unique: true
  end

  create_table "weekly_goals", force: :cascade do |t|
    t.bigint "user_id", null: false
    t.date "week_start", null: false
    t.float "target_hours", default: 0.0, null: false
    t.integer "target_questions", default: 0, null: false
    t.float "target_percentage", default: 0.0, null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["user_id", "week_start"], name: "index_weekly_goals_on_user_id_and_week_start", unique: true
    t.index ["user_id"], name: "index_weekly_goals_on_user_id"
  end

  add_foreign_key "refresh_tokens", "users"
  add_foreign_key "study_sessions", "topics"
  add_foreign_key "subjects", "users"
  add_foreign_key "topics", "subjects"
  add_foreign_key "user_configs", "users"
  add_foreign_key "weekly_goals", "users"
end
