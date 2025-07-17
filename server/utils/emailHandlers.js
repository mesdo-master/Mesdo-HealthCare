const nodemailer = require("nodemailer");
const crypto = require("crypto");

// Enhanced transporter configuration for better deliverability
const transporter = nodemailer.createTransport({
  service: "Gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
  // Additional configuration for better deliverability
  pool: true, // Use connection pooling
  maxConnections: 5,
  maxMessages: 100,
  rateDelta: 1000, // 1 second
  rateLimit: 5, // 5 emails per second
  tls: {
    rejectUnauthorized: false,
  },
});

// Verify transporter configuration
transporter.verify((error, success) => {
  if (error) {
    console.error("Email transporter configuration error:", error);
  } else {
    console.log("Email transporter is ready to send messages");
  }
});

// Helper function to add delay for better deliverability
const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const generateVerificationCode = () => {
  return Math.floor(100000 + Math.random() * 900000).toString(); // 6-digit code
};

const sendVerificationEmail = async (email, verificationCode) => {
  try {
    // Add a small delay to avoid being flagged as spam
    await delay(500);

    // Enhanced email options for better deliverability
    const mailOptions = {
      from: {
        name: "Mesdo Healthcare",
        address: process.env.EMAIL_USER,
      },
      to: email,
      subject: "🔐 Verify Your Email Address - Mesdo Healthcare",
      // Add text version for better spam score
      text: `
Welcome to Mesdo Healthcare!

Your email verification code is: ${verificationCode}

This code will expire in 1 hour.

If you didn't create an account with Mesdo Healthcare, please ignore this email.

Best regards,
The Mesdo Healthcare Team
      `.trim(),
      html: `
        <!DOCTYPE html>
        <html lang="en">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Verify Your Email - Mesdo Healthcare</title>
          <!--[if mso]>
          <noscript>
            <xml>
              <o:OfficeDocumentSettings>
                <o:PixelsPerInch>96</o:PixelsPerInch>
              </o:OfficeDocumentSettings>
            </xml>
          </noscript>
          <![endif]-->
        </head>
        <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f6f9fc;">
          <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background-color: #f6f9fc;">
            <tr>
              <td align="center" style="padding: 40px 0;">
                <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="600" style="max-width: 600px; background-color: #ffffff; border-radius: 12px; box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);">
                  
                  <!-- Header -->
                  <tr>
                    <td style="padding: 40px 40px 20px 40px; text-align: center; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); border-radius: 12px 12px 0 0;">
                      <img src="https://res.cloudinary.com/dy9voteoc/image/upload/v1743179165/mesdo_logo_i08ymk.png" alt="Mesdo Healthcare" style="height: 50px; margin-bottom: 20px;">
                      <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: 600; text-shadow: 0 2px 4px rgba(0,0,0,0.1);">
                        Welcome to Mesdo Healthcare!
                      </h1>
                      <p style="color: #ffffff; margin: 10px 0 0 0; font-size: 16px; opacity: 0.9;">
                        Please verify your email address to get started
                      </p>
                    </td>
                  </tr>
                  
                  <!-- Main Content -->
                  <tr>
                    <td style="padding: 40px;">
                      <div style="text-align: center; margin-bottom: 30px;">
                        <h2 style="color: #2d3748; margin: 0 0 20px 0; font-size: 24px; font-weight: 600;">
                          Your Verification Code
                        </h2>
                        <p style="color: #718096; margin: 0 0 30px 0; font-size: 16px; line-height: 1.5;">
                          Enter this code in the verification page to complete your registration:
                        </p>
                      </div>
                      
                      <!-- Verification Code Box -->
                      <div style="background: linear-gradient(135deg, #f7fafc 0%, #edf2f7 100%); border: 2px solid #e2e8f0; border-radius: 12px; padding: 30px; text-align: center; margin: 30px 0;">
                        <div style="font-size: 36px; font-weight: 700; color: #2b6cb0; letter-spacing: 8px; font-family: 'Courier New', monospace; margin: 0; text-shadow: 0 2px 4px rgba(0,0,0,0.1);">
                          ${verificationCode}
                        </div>
                        <p style="color: #718096; margin: 15px 0 0 0; font-size: 14px;">
                          ⏰ This code expires in 1 hour
                        </p>
                      </div>
                      
                      <!-- Instructions -->
                      <div style="background: #f0fff4; border: 1px solid #9ae6b4; border-radius: 8px; padding: 20px; margin: 30px 0;">
                        <h3 style="color: #276749; margin: 0 0 10px 0; font-size: 16px; font-weight: 600;">
                          📝 Next Steps:
                        </h3>
                        <ol style="color: #2f855a; margin: 0; padding-left: 20px; font-size: 14px; line-height: 1.6;">
                          <li>Return to the Mesdo Healthcare verification page</li>
                          <li>Enter the 6-digit code shown above</li>
                          <li>Complete your profile setup</li>
                          <li>Start connecting with healthcare professionals</li>
                        </ol>
                      </div>
                      
                      <!-- Security Notice -->
                      <div style="background: #fffbf0; border: 1px solid #f6e05e; border-radius: 8px; padding: 20px; margin: 30px 0;">
                        <h3 style="color: #744210; margin: 0 0 10px 0; font-size: 16px; font-weight: 600;">
                          🔒 Security Notice:
                        </h3>
                        <p style="color: #975a16; margin: 0; font-size: 14px; line-height: 1.6;">
                          If you didn't create an account with Mesdo Healthcare, please ignore this email. 
                          Your email address will not be used for any further communications.
                        </p>
                      </div>
                    </td>
                  </tr>
                  
                  <!-- Footer -->
                  <tr>
                    <td style="padding: 30px 40px; text-align: center; background-color: #f8fafc; border-radius: 0 0 12px 12px; border-top: 1px solid #e2e8f0;">
                      <p style="color: #718096; margin: 0 0 10px 0; font-size: 14px;">
                        Need help? Contact our support team at 
                        <a href="mailto:support@mesdo.com" style="color: #3182ce; text-decoration: none;">support@mesdo.com</a>
                      </p>
                      <p style="color: #a0aec0; margin: 0; font-size: 12px;">
                        © 2024 Mesdo Healthcare. All rights reserved.
                      </p>
                      <p style="color: #a0aec0; margin: 5px 0 0 0; font-size: 12px;">
                        This email was sent to ${email}
                      </p>
                    </td>
                  </tr>
                  
                </table>
              </td>
            </tr>
          </table>
        </body>
        </html>
      `,
      // Additional headers for better deliverability
      headers: {
        "X-Mailer": "Mesdo Healthcare System",
        "X-Priority": "1",
        "X-MSMail-Priority": "High",
        Importance: "high",
        "List-Unsubscribe": "<mailto:unsubscribe@mesdo.com>",
        "Return-Path": process.env.EMAIL_USER,
      },
      // Message priority
      priority: "high",
      // Delivery options
      dsn: {
        id: `verification-${Date.now()}`,
        return: "headers",
        notify: ["failure", "delay"],
        recipient: email,
      },
    };

    const info = await transporter.sendMail(mailOptions);

    console.log(`✅ Verification email sent successfully to ${email}`);
    console.log(`📧 Message ID: ${info.messageId}`);
    console.log(`📬 Response: ${info.response}`);

    return {
      success: true,
      message: "Verification email sent successfully.",
      messageId: info.messageId,
      response: info.response,
    };
  } catch (error) {
    console.error("❌ Error sending verification email:", error);
    return {
      success: false,
      message: "Failed to send verification email. Please try again later.",
      error: error.message,
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
    const resetLink = `${
      process.env.CLIENT_URL || "https://mesdo-health-care-u5s9.vercel.app"
    }/reset-password/${resetToken}`;

    // Enhanced password reset email
    const mailOptions = {
      from: {
        name: "Mesdo Healthcare Security",
        address: process.env.EMAIL_USER,
      },
      to: user.email,
      subject: "🔐 Password Reset Request - Mesdo Healthcare",
      text: `
Password Reset Request

Hello ${user.name || "User"},

You requested a password reset for your Mesdo Healthcare account.

Click the link below to reset your password:
${resetLink}

This link will expire in 10 minutes for security reasons.

If you didn't request this password reset, please ignore this email.

Best regards,
The Mesdo Healthcare Security Team
      `.trim(),
      html: `
        <!DOCTYPE html>
        <html lang="en">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Password Reset - Mesdo Healthcare</title>
        </head>
        <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #f6f9fc;">
          <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background-color: #f6f9fc;">
            <tr>
              <td align="center" style="padding: 40px 0;">
                <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="600" style="max-width: 600px; background-color: #ffffff; border-radius: 12px; box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);">
                  
                  <!-- Header -->
                  <tr>
                    <td style="padding: 40px 40px 20px 40px; text-align: center; background: linear-gradient(135deg, #f56565 0%, #c53030 100%); border-radius: 12px 12px 0 0;">
                      <img src="https://res.cloudinary.com/dy9voteoc/image/upload/v1743179165/mesdo_logo_i08ymk.png" alt="Mesdo Healthcare" style="height: 50px; margin-bottom: 20px; filter: brightness(0) invert(1);">
                      <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: 600;">
                        🔐 Password Reset Request
                      </h1>
                      <p style="color: #ffffff; margin: 10px 0 0 0; font-size: 16px; opacity: 0.9;">
                        Someone requested a password reset for your account
                      </p>
                    </td>
                  </tr>
                  
                  <!-- Main Content -->
                  <tr>
                    <td style="padding: 40px;">
                      <p style="color: #2d3748; margin: 0 0 20px 0; font-size: 16px; line-height: 1.6;">
                        Hello ${user.name || "User"},
                      </p>
                      <p style="color: #4a5568; margin: 0 0 30px 0; font-size: 16px; line-height: 1.6;">
                        You requested a password reset for your Mesdo Healthcare account. Click the button below to reset your password:
                      </p>
                      
                      <!-- Reset Button -->
                      <div style="text-align: center; margin: 40px 0;">
                        <a href="${resetLink}" style="display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: #ffffff; text-decoration: none; padding: 16px 32px; border-radius: 8px; font-size: 16px; font-weight: 600; box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);">
                          Reset My Password
                        </a>
                      </div>
                      
                      <p style="color: #718096; margin: 30px 0 0 0; font-size: 14px; line-height: 1.6;">
                        Or copy and paste this link into your browser:<br>
                        <a href="${resetLink}" style="color: #3182ce; word-break: break-all;">${resetLink}</a>
                      </p>
                      
                      <!-- Security Notice -->
                      <div style="background: #fffbf0; border: 1px solid #f6e05e; border-radius: 8px; padding: 20px; margin: 30px 0;">
                        <h3 style="color: #744210; margin: 0 0 10px 0; font-size: 16px; font-weight: 600;">
                          ⚠️ Security Notice:
                        </h3>
                        <ul style="color: #975a16; margin: 0; padding-left: 20px; font-size: 14px; line-height: 1.6;">
                          <li>This link will expire in 10 minutes</li>
                          <li>If you didn't request this reset, please ignore this email</li>
                          <li>Your password will remain unchanged</li>
                        </ul>
                      </div>
                    </td>
                  </tr>
                  
                  <!-- Footer -->
                  <tr>
                    <td style="padding: 30px 40px; text-align: center; background-color: #f8fafc; border-radius: 0 0 12px 12px; border-top: 1px solid #e2e8f0;">
                      <p style="color: #718096; margin: 0 0 10px 0; font-size: 14px;">
                        Need help? Contact our support team at 
                        <a href="mailto:support@mesdo.com" style="color: #3182ce; text-decoration: none;">support@mesdo.com</a>
                      </p>
                      <p style="color: #a0aec0; margin: 0; font-size: 12px;">
                        © 2024 Mesdo Healthcare. All rights reserved.
                      </p>
                    </td>
                  </tr>
                  
                </table>
              </td>
            </tr>
          </table>
        </body>
        </html>
      `,
      headers: {
        "X-Mailer": "Mesdo Healthcare Security System",
        "X-Priority": "1",
        "X-MSMail-Priority": "High",
        Importance: "high",
        "List-Unsubscribe": "<mailto:unsubscribe@mesdo.com>",
        "Return-Path": process.env.EMAIL_USER,
      },
      priority: "high",
    };

    const info = await transporter.sendMail(mailOptions);

    console.log(`✅ Password reset email sent successfully to ${user.email}`);
    console.log(`📧 Message ID: ${info.messageId}`);

    return {
      success: true,
      message: "Reset email sent successfully.",
      messageId: info.messageId,
    };
  } catch (error) {
    console.error("❌ Error sending reset password email:", error);
    return {
      success: false,
      message: "Failed to send password reset email. Please try again later.",
      error: error.message,
    };
  }
};

module.exports = {
  resetPasswordEmail,
  sendVerificationEmail,
  generateVerificationCode,
  transporter, // Export for testing
};
