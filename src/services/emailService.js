// Email Service for sending OTP codes
// Mock implementation - in production, integrate with SendGrid, Mailgun, AWS SES, or any email service

export const emailService = {
  // Send OTP email (mock - not actually sending)
  sendOTPEmail: async (email, otpCode) => {
    try {
      // Mock email sending - in production, integrate with email service
      console.log(`Mock: OTP email would be sent to ${email} with code ${otpCode}`);
      return { success: true, error: null };
    } catch (error) {
      return { success: false, error };
    }
  },

  // Send OTP via SendGrid (example - not implemented)
  sendOTPViaSendGrid: async (email, otpCode) => {
    try {
      // Example implementation with SendGrid
      // You'll need to install: npm install @sendgrid/mail
      /*
      const sgMail = require('@sendgrid/mail');
      sgMail.setApiKey(process.env.SENDGRID_API_KEY);
      
      const msg = {
        to: email,
        from: 'noreply@yourapp.com',
        subject: 'Verify Your Email - SharePost',
        html: `
          <h2>Verify Your Email</h2>
          <p>Your OTP code is: <strong>${otpCode}</strong></p>
          <p>This code will expire in 10 minutes.</p>
        `,
      };
      
      await sgMail.send(msg);
      */
      
      console.log(`Mock: SendGrid OTP would be sent to ${email} with code ${otpCode}`);
      return { success: true, error: null };
    } catch (error) {
      return { success: false, error };
    }
  },
};
