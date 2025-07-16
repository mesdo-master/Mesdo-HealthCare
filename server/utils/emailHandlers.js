const nodemailer = require("nodemailer");
const crypto = require("crypto");

const transporter = nodemailer.createTransport({
  service: "Gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

const generateVerificationCode = () => {
  return Math.floor(100000 + Math.random() * 900000).toString(); // 6-digit code
};

const sendVerificationEmail = async (email, verificationCode) => {
  try {
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: email,
      subject: "Verify Your Email - Mesdo",
      html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
                    <div style="text-align: center; margin-bottom: 30px;">
                        <h1 style="color: #1890FF; margin-bottom: 10px;">Welcome to Mesdo!</h1>
                        <p style="color: #666; font-size: 16px;">Please verify your email address to complete your registration</p>
                    </div>
                    
                    <div style="background: #f8f9fa; padding: 30px; border-radius: 10px; text-align: center; margin-bottom: 30px;">
                        <h2 style="color: #333; margin-bottom: 20px;">Your Verification Code</h2>
                        <div style="font-size: 32px; font-weight: bold; color: #1890FF; letter-spacing: 5px; margin: 20px 0;">
                            ${verificationCode}
                        </div>
                        <p style="color: #666; font-size: 14px;">This code will expire in 1 hour</p>
                    </div>
                    
                    <div style="text-align: center; margin-bottom: 30px;">
                        <p style="color: #666; font-size: 14px;">
                            If you didn't create an account with Mesdo, please ignore this email.
                        </p>
                    </div>
                    
                    <div style="text-align: center; padding-top: 20px; border-top: 1px solid #eee;">
                        <p style="color: #999; font-size: 12px;">
                            © 2024 Mesdo. All rights reserved.
                        </p>
                    </div>
                </div>
            `,
    });

    console.log(`Verification email sent to ${email}`);
    return { success: true, message: "Verification email sent successfully." };
  } catch (error) {
    console.error("Error sending verification email:", error);
    return {
      success: false,
      message: "Failed to send verification email. Please try again later.",
      error,
    };
  }
};

const resetPasswordEmail = async (user) => {
  try {
    // Generate a reset token valid for 10 minutes
    const resetToken = crypto.randomBytes(32).toString("hex");
    user.resetPasswordToken = resetToken;
    user.resetPasswordExpires = Date.now() + 10 * 60 * 1000; // 10 minutes

    // Save the token and expiry time to the user document
    await user.save();

    // Construct the password reset link
    const resetLink = `${process.env.CLIENT_URL}/reset-password/${resetToken}`;

    // Send the password reset email
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: user.email,
      subject: "Password Reset Request",
      html: `<p>You requested a password reset. Click <a href="${resetLink}">here</a> to reset your password. This link is valid for 10 minutes.</p>`,
    });

    console.log(`Password reset email sent to ${user.email}`);
    return { success: true, message: "Reset email sent successfully." };
  } catch (error) {
    console.error("Error sending reset password email:", error);
    // Depending on your error handling strategy, either return a failure response or rethrow the error
    return {
      success: false,
      message: "Failed to send password reset email. Please try again later.",
      error,
    };
  }
};

module.exports = {
  resetPasswordEmail,
  sendVerificationEmail,
  generateVerificationCode,
};
