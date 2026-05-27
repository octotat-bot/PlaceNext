const nodemailer = require('nodemailer');
const { logger } = require('./logger');

// Create transporter
const createTransporter = () => {
  // Use environment variables for email configuration
  if (process.env.SMTP_HOST) {
    return nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: process.env.SMTP_PORT || 587,
      secure: process.env.SMTP_SECURE === 'true',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
  }

  // Fallback to ethereal for development/testing
  return nodemailer.createTransport({
    host: 'smtp.ethereal.email',
    port: 587,
    auth: {
      user: process.env.ETHEREAL_USER || 'ethereal.user@ethereal.email',
      pass: process.env.ETHEREAL_PASS || 'ethereal_pass',
    },
  });
};

const transporter = createTransporter();

/**
 * Send email with template
 */
const sendEmail = async ({ to, subject, html, text }) => {
  try {
    const mailOptions = {
      from: process.env.EMAIL_FROM || '"Placement Portal" <noreply@placementportal.edu>',
      to,
      subject,
      html,
      text: text || html.replace(/<[^>]*>/g, ''),
    };

    const info = await transporter.sendMail(mailOptions);
    logger.info('Email sent successfully', { to, subject, messageId: info.messageId });

    // In development, log the preview URL
    if (process.env.NODE_ENV !== 'production') {
      const previewUrl = nodemailer.getTestMessageUrl(info);
      if (previewUrl) {
        logger.info('Email preview URL', { url: previewUrl });
      }
    }

    return { success: true, messageId: info.messageId };
  } catch (error) {
    logger.error('Failed to send email', { to, subject, error: error.message });
    throw error;
  }
};

/**
 * Email verification template
 */
const sendVerificationEmail = async (user, verificationToken) => {
  const verificationUrl = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/verify-email?token=${verificationToken}`;

  const html = `
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Verify Your Email</title>
        </head>
        <body style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f4f7fa; margin: 0; padding: 40px 20px;">
            <div style="max-width: 600px; margin: 0 auto; background: white; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
                <div style="background: linear-gradient(135deg, #6366f1, #8b5cf6); padding: 40px 30px; text-align: center;">
                    <h1 style="color: white; margin: 0; font-size: 28px;">Welcome to Placement Portal! 🎓</h1>
                </div>
                <div style="padding: 40px 30px;">
                    <p style="color: #374151; font-size: 16px; line-height: 1.6;">Hi ${user.name || 'there'},</p>
                    <p style="color: #374151; font-size: 16px; line-height: 1.6;">Thank you for registering! Please verify your email address to activate your account.</p>
                    <div style="text-align: center; margin: 30px 0;">
                        <a href="${verificationUrl}" style="display: inline-block; background: linear-gradient(135deg, #6366f1, #8b5cf6); color: white; text-decoration: none; padding: 14px 40px; border-radius: 10px; font-weight: 600; font-size: 16px;">Verify Email Address</a>
                    </div>
                    <p style="color: #6b7280; font-size: 14px; line-height: 1.6;">Or copy and paste this link in your browser:</p>
                    <p style="color: #6366f1; font-size: 14px; word-break: break-all;">${verificationUrl}</p>
                    <p style="color: #6b7280; font-size: 14px; margin-top: 30px;">This link expires in 24 hours.</p>
                </div>
                <div style="background: #f9fafb; padding: 20px 30px; text-align: center; border-top: 1px solid #e5e7eb;">
                    <p style="color: #9ca3af; font-size: 12px; margin: 0;">© 2026 Placement Portal. All rights reserved.</p>
                </div>
            </div>
        </body>
        </html>
    `;

  return sendEmail({
    to: user.email,
    subject: 'Verify Your Email - Placement Portal',
    html,
  });
};

/**
 * Password reset template
 */
const sendPasswordResetEmail = async (user, resetToken) => {
  const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/reset-password?token=${resetToken}`;

  const html = `
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Reset Your Password</title>
        </head>
        <body style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f4f7fa; margin: 0; padding: 40px 20px;">
            <div style="max-width: 600px; margin: 0 auto; background: white; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
                <div style="background: linear-gradient(135deg, #ef4444, #f97316); padding: 40px 30px; text-align: center;">
                    <h1 style="color: white; margin: 0; font-size: 28px;">Password Reset Request 🔐</h1>
                </div>
                <div style="padding: 40px 30px;">
                    <p style="color: #374151; font-size: 16px; line-height: 1.6;">Hi ${user.name || 'there'},</p>
                    <p style="color: #374151; font-size: 16px; line-height: 1.6;">We received a request to reset your password. Click the button below to create a new password:</p>
                    <div style="text-align: center; margin: 30px 0;">
                        <a href="${resetUrl}" style="display: inline-block; background: linear-gradient(135deg, #6366f1, #8b5cf6); color: white; text-decoration: none; padding: 14px 40px; border-radius: 10px; font-weight: 600; font-size: 16px;">Reset Password</a>
                    </div>
                    <p style="color: #6b7280; font-size: 14px; line-height: 1.6;">Or copy and paste this link in your browser:</p>
                    <p style="color: #6366f1; font-size: 14px; word-break: break-all;">${resetUrl}</p>
                    <div style="background: #fef3c7; border-radius: 8px; padding: 15px; margin-top: 20px;">
                        <p style="color: #92400e; font-size: 14px; margin: 0;">⚠️ If you didn't request this, please ignore this email. Your password will remain unchanged.</p>
                    </div>
                    <p style="color: #6b7280; font-size: 14px; margin-top: 20px;">This link expires in 1 hour.</p>
                </div>
                <div style="background: #f9fafb; padding: 20px 30px; text-align: center; border-top: 1px solid #e5e7eb;">
                    <p style="color: #9ca3af; font-size: 12px; margin: 0;">© 2026 Placement Portal. All rights reserved.</p>
                </div>
            </div>
        </body>
        </html>
    `;

  return sendEmail({
    to: user.email,
    subject: 'Password Reset - Placement Portal',
    html,
  });
};

/**
 * Recruiter approval notification
 */
const sendApprovalEmail = async (user, approved, reason = '') => {
  const loginUrl = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/login`;

  const html = approved ? `
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Account Approved</title>
        </head>
        <body style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f4f7fa; margin: 0; padding: 40px 20px;">
            <div style="max-width: 600px; margin: 0 auto; background: white; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
                <div style="background: linear-gradient(135deg, #10b981, #059669); padding: 40px 30px; text-align: center;">
                    <h1 style="color: white; margin: 0; font-size: 28px;">Account Approved! ✅</h1>
                </div>
                <div style="padding: 40px 30px;">
                    <p style="color: #374151; font-size: 16px; line-height: 1.6;">Hi ${user.name || 'there'},</p>
                    <p style="color: #374151; font-size: 16px; line-height: 1.6;">Great news! Your recruiter account has been approved. You can now log in and start posting job opportunities.</p>
                    <div style="text-align: center; margin: 30px 0;">
                        <a href="${loginUrl}" style="display: inline-block; background: linear-gradient(135deg, #6366f1, #8b5cf6); color: white; text-decoration: none; padding: 14px 40px; border-radius: 10px; font-weight: 600; font-size: 16px;">Log In Now</a>
                    </div>
                </div>
                <div style="background: #f9fafb; padding: 20px 30px; text-align: center; border-top: 1px solid #e5e7eb;">
                    <p style="color: #9ca3af; font-size: 12px; margin: 0;">© 2026 Placement Portal. All rights reserved.</p>
                </div>
            </div>
        </body>
        </html>
    ` : `
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Account Application Status</title>
        </head>
        <body style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f4f7fa; margin: 0; padding: 40px 20px;">
            <div style="max-width: 600px; margin: 0 auto; background: white; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
                <div style="background: linear-gradient(135deg, #6b7280, #4b5563); padding: 40px 30px; text-align: center;">
                    <h1 style="color: white; margin: 0; font-size: 28px;">Application Update</h1>
                </div>
                <div style="padding: 40px 30px;">
                    <p style="color: #374151; font-size: 16px; line-height: 1.6;">Hi ${user.name || 'there'},</p>
                    <p style="color: #374151; font-size: 16px; line-height: 1.6;">We've reviewed your recruiter registration application. Unfortunately, we're unable to approve your account at this time.</p>
                    ${reason ? `<div style="background: #f3f4f6; border-radius: 8px; padding: 15px; margin: 20px 0;"><p style="color: #374151; font-size: 14px; margin: 0;"><strong>Reason:</strong> ${reason}</p></div>` : ''}
                    <p style="color: #6b7280; font-size: 14px; line-height: 1.6;">If you believe this was a mistake or have questions, please contact our support team.</p>
                </div>
                <div style="background: #f9fafb; padding: 20px 30px; text-align: center; border-top: 1px solid #e5e7eb;">
                    <p style="color: #9ca3af; font-size: 12px; margin: 0;">© 2026 Placement Portal. All rights reserved.</p>
                </div>
            </div>
        </body>
        </html>
    `;

  return sendEmail({
    to: user.email,
    subject: approved ? 'Your Account Has Been Approved! - Placement Portal' : 'Account Application Update - Placement Portal',
    html,
  });
};

/**
 * Welcome email after successful verification
 */
const sendWelcomeEmail = async (user) => {
  const dashboardUrl = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/dashboard`;

  const html = `
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Welcome!</title>
        </head>
        <body style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f4f7fa; margin: 0; padding: 40px 20px;">
            <div style="max-width: 600px; margin: 0 auto; background: white; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
                <div style="background: linear-gradient(135deg, #6366f1, #8b5cf6); padding: 40px 30px; text-align: center;">
                    <h1 style="color: white; margin: 0; font-size: 28px;">You're All Set! 🎉</h1>
                </div>
                <div style="padding: 40px 30px;">
                    <p style="color: #374151; font-size: 16px; line-height: 1.6;">Hi ${user.name || 'there'},</p>
                    <p style="color: #374151; font-size: 16px; line-height: 1.6;">Your email has been verified successfully! You now have full access to the Placement Portal.</p>
                    <div style="background: #f0fdf4; border-radius: 12px; padding: 20px; margin: 20px 0;">
                        <h3 style="color: #166534; margin: 0 0 10px 0;">🚀 Getting Started</h3>
                        <ul style="color: #374151; font-size: 14px; line-height: 1.8; margin: 0; padding-left: 20px;">
                            <li>Complete your profile with your academic details</li>
                            <li>Upload your resume for better visibility</li>
                            <li>Browse available placement drives</li>
                            <li>Apply to opportunities that match your skills</li>
                        </ul>
                    </div>
                    <div style="text-align: center; margin: 30px 0;">
                        <a href="${dashboardUrl}" style="display: inline-block; background: linear-gradient(135deg, #6366f1, #8b5cf6); color: white; text-decoration: none; padding: 14px 40px; border-radius: 10px; font-weight: 600; font-size: 16px;">Go to Dashboard</a>
                    </div>
                </div>
                <div style="background: #f9fafb; padding: 20px 30px; text-align: center; border-top: 1px solid #e5e7eb;">
                    <p style="color: #9ca3af; font-size: 12px; margin: 0;">© 2026 Placement Portal. All rights reserved.</p>
                </div>
            </div>
        </body>
        </html>
    `;

  return sendEmail({
    to: user.email,
    subject: 'Welcome to Placement Portal! 🎓',
    html,
  });
};

module.exports = {
  sendEmail,
  sendVerificationEmail,
  sendPasswordResetEmail,
  sendApprovalEmail,
  sendWelcomeEmail,
};
