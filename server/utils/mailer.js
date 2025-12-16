// mailer.js - Brevo (Sendinblue) Version with all features
const SibApiV3Sdk = require('@sendinblue/client');
require('dotenv').config();

// Configure Brevo API
const apiInstance = new SibApiV3Sdk.TransactionalEmailsApi();
apiInstance.setApiKey(
  SibApiV3Sdk.TransactionalEmailsApiApiKeys.apiKey,
  process.env.BREVO_API_KEY
);

/**
 * Core function to send email via Brevo
 */
async function sendEmail(to, subject, html, textContent = null, attachments = [], cc = [], bcc = []) {
  try {
    const sendSmtpEmail = new SibApiV3Sdk.SendSmtpEmail();
    
    sendSmtpEmail.sender = {
      email: process.env.EMAIL_FROM || 'noreply@yourdomain.com',
      name: 'Internship Platform'
    };
    
    sendSmtpEmail.to = [{ email: to }];
    sendSmtpEmail.subject = subject;
    sendSmtpEmail.htmlContent = html;
    
    // Add plain text version if provided
    if (textContent) {
      sendSmtpEmail.textContent = textContent;
    }
    
    // Add CC if provided
    if (cc && cc.length > 0) {
      sendSmtpEmail.cc = cc.map(email => ({ email }));
    }
    
    // Add BCC if provided
    if (bcc && bcc.length > 0) {
      sendSmtpEmail.bcc = bcc.map(email => ({ email }));
    }
    
    // Add attachments if provided
    if (attachments && attachments.length > 0) {
      sendSmtpEmail.attachment = attachments.map(att => ({
        content: att.content,
        name: att.filename,
      }));
    }
    
    const response = await apiInstance.sendTransacEmail(sendSmtpEmail);
    
    console.log(`📧 Email sent to ${to} via Brevo | MessageID: ${response.messageId}`);
    
    return {
      success: true,
      messageId: response.messageId,
    };
  } catch (error) {
    console.error('❌ Brevo error:', error);
    
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response body:', error.response.body);
    }
    
    throw new Error(`Failed to send email: ${error.message}`);
  }
}

/**
 * Send email with retry logic
 */
async function sendEmailWithRetry(to, subject, html, textContent = null, maxRetries = 3) {
  let lastError;
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await sendEmail(to, subject, html, textContent);
    } catch (error) {
      lastError = error;
      console.error(`❌ Email attempt ${attempt} failed:`, error.message);
      
      if (attempt < maxRetries) {
        const waitTime = Math.pow(2, attempt) * 1000;
        console.log(`⏳ Retrying in ${waitTime}ms...`);
        await new Promise(resolve => setTimeout(resolve, waitTime));
      }
    }
  }
  
  throw new Error(`Failed after ${maxRetries} attempts: ${lastError.message}`);
}

/**
 * Verify Brevo configuration
 */
async function verifyConfiguration() {
  try {
    if (!process.env.BREVO_API_KEY) {
      throw new Error('BREVO_API_KEY not found in environment variables');
    }
    
    // Check if it's the correct type of key
    if (process.env.BREVO_API_KEY.startsWith('xsmtpsib-')) {
      throw new Error('Wrong key type! You are using SMTP key. Please use API key (starts with xkeysib-)');
    }
    
    console.log('✅ Brevo API key found');
    console.log(`✅ Key type: ${process.env.BREVO_API_KEY.substring(0, 10)}...`);
    console.log('✅ Brevo mailer configured successfully');
    return true;
  } catch (error) {
    console.error('❌ Brevo configuration error:', error.message);
    return false;
  }
}

// Verify on startup
verifyConfiguration();

module.exports = {
  // Send OTP email
  sendOtp: async (email, otp) => {
    const subject = 'Your OTP';
    const textContent = `Your OTP is ${otp}. It is valid for 10 minutes.`;
    const htmlContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: #667eea; color: white; padding: 20px; text-align: center;">
          <h2>Internship Platform</h2>
        </div>
        <div style="padding: 20px; background: #f9f9f9;">
          <h3 style="color: #333;">Your One-Time Password</h3>
          <div style="background: white; padding: 20px; border-radius: 8px; text-align: center; margin: 20px 0;">
            <h1 style="color: #667eea; font-size: 36px; letter-spacing: 8px; margin: 0;">${otp}</h1>
          </div>
          <p style="color: #666;">This OTP is valid for <strong>10 minutes</strong>.</p>
          <p style="color: #666;">If you didn't request this, please ignore this email.</p>
        </div>
        <div style="background: #333; color: #999; padding: 15px; text-align: center; font-size: 12px;">
          <p>© ${new Date().getFullYear()} Internship Platform. All rights reserved.</p>
        </div>
      </div>
    `;

    return await sendEmailWithRetry(email, subject, htmlContent, textContent);
  },

  // Send internship match notification
  sendInternshipMatch: async (email, emailContent) => {
    return await sendEmailWithRetry(
      email,
      emailContent.subject,
      emailContent.htmlContent,
      emailContent.textContent
    );
  },

  // Send general notification
  sendGeneralNotification: async (email, subject, message, htmlMessage = null) => {
    const textContent = message;
    const htmlContent = htmlMessage || `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: #667eea; color: white; padding: 20px; text-align: center;">
          <h2>PM Internship Scheme</h2>
        </div>
        <div style="padding: 20px;">
          <p style="color: #333; line-height: 1.6;">${message}</p>
        </div>
        <div style="background: #f9f9f9; padding: 15px; text-align: center;">
          <small style="color: #666;">Government of India Initiative</small>
        </div>
      </div>
    `;

    return await sendEmailWithRetry(email, subject, htmlContent, textContent);
  },

  // Send bulk emails with delay
  sendBulkEmails: async (emailList, subject, messageTemplate, delay = 100) => {
    const results = { sent: 0, failed: 0, errors: [] };

    for (let i = 0; i < emailList.length; i++) {
      const { email, data } = emailList[i];
      
      try {
        let personalizedMessage = messageTemplate;
        
        // Replace placeholders in message template
        if (data) {
          Object.keys(data).forEach(key => {
            personalizedMessage = personalizedMessage.replace(
              new RegExp(`{{${key}}}`, 'g'), 
              data[key]
            );
          });
        }

        const textContent = personalizedMessage;
        const htmlContent = `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <div style="background: #667eea; color: white; padding: 20px; text-align: center;">
              <h2>PM Internship Scheme</h2>
            </div>
            <div style="padding: 20px;">
              <div style="color: #333; line-height: 1.6;">${personalizedMessage.replace(/\n/g, '<br>')}</div>
            </div>
            <div style="background: #f9f9f9; padding: 15px; text-align: center;">
              <small style="color: #666;">Government of India Initiative</small>
            </div>
          </div>
        `;

        await sendEmail(email, subject, htmlContent, textContent);
        results.sent++;
        
        console.log(`✅ Bulk email ${i + 1}/${emailList.length} sent to ${email}`);
        
        // Add delay to prevent rate limiting
        if (delay > 0 && i < emailList.length - 1) {
          await new Promise(resolve => setTimeout(resolve, delay));
        }
        
      } catch (error) {
        console.error(`❌ Failed to send bulk email to ${email}:`, error.message);
        results.failed++;
        results.errors.push({ email, error: error.message });
      }
    }

    console.log(`\n📊 Bulk email results: ${results.sent} sent, ${results.failed} failed`);
    return results;
  },

  // Get API instance (for advanced usage)
  getApiInstance: () => {
    return apiInstance;
  },

  // Verify configuration
  verifyConfiguration
};