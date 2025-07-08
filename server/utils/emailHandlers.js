const nodemailer = require('nodemailer')
const crypto = require('crypto');

const transporter = nodemailer.createTransport({
    service: "Gmail",
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    },
});

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
            html: `<p>You requested a password reset. Click <a href="${resetLink}">here</a> to reset your password. This link is valid for 10 minutes.</p>`
        });

        console.log(`Password reset email sent to ${user.email}`);
        return { success: true, message: "Reset email sent successfully." };

    } catch (error) {
        console.error("Error sending reset password email:", error);
        // Depending on your error handling strategy, either return a failure response or rethrow the error
        return { success: false, message: "Failed to send password reset email. Please try again later.", error };
    }
};


module.exports = { resetPasswordEmail };