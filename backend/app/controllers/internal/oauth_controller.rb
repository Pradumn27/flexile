# frozen_string_literal: true

class Internal::OauthController < Internal::BaseController
  include OtpValidation, UserDataSerialization, JwtAuthenticatable

  # POST /internal/oauth
  # Params: { email: string, name?: string, image?: string }
  def create
    email = params[:email]
    name = params[:name]
    image = params[:image]

    return unless validate_email_param(email)

    user = User.find_by(email: email)

    if user
      user.update!(current_sign_in_at: Time.current)
      return success_response_with_jwt(user)
    end

    result = create_user_with_defaults(email:, name:, image:)

    if result[:success]
      success_response_with_jwt(result[:user], :created)
    else
      render json: { error: result[:error_message] }, status: :unprocessable_entity
    end
  end

  private
    def create_user_with_defaults(email:, name:, image:)
      ApplicationRecord.transaction do
        user = User.new(email: email)
        user.name = name if name.present?
        user.image = image if image.present?

        # Mark email verified/confirmed via OAuth
        user.confirmed_at = Time.current
        user.email_verified = true if user.respond_to?(:email_verified)

        # Skip validations similar to temp user creation during OTP signup
        user.save!(validate: false)

        # Create default company and role similar to completed signup
        company = Company.create!(
          email: user.email,
          country_code: user.country_code || "US",
          default_currency: "USD"
        )
        user.company_administrators.create!(company: company)

        { success: true, user: user }
      end
    rescue ActiveRecord::RecordInvalid => e
      { success: false, error_message: e.record.errors.full_messages.to_sentence }
    end
end


