// emailService.js
// Email service for user verification and notifications

const nodemailer = require("nodemailer");
const crypto = require("crypto");

// Try to load SendGrid - it might not be installed yet
let sgMail = null;
try {
  sgMail = require('@sendgrid/mail');
} catch (error) {
  console.log("📧 SendGrid not installed, using nodemailer only");
}

/**
 * Email service configuration and utilities
 */
class EmailService {
  constructor() {
    this.transporter = null;
    this.isConfigured = false;
    this.emailProvider = null; // 'sendgrid', 'smtp', or 'fallback'
    this.initializeTransporter();
  }

  /**
   * Initialize email transporter based on environment
   */
  initializeTransporter() {
    console.log("🚨🚨🚨 EMAIL SERVICE INITIALIZATION STARTING 🚨🚨🚨");
    console.log("=".repeat(60));

    try {
      console.log("📧 [DEBUG] Checking email environment variables...");
      console.log(
        `📧 [DEBUG] SENDGRID_API_KEY: ${process.env.SENDGRID_API_KEY ? 'SET' : 'NOT SET'}`
      );
      console.log(
        `📧 [DEBUG] EMAIL_HOST: ${process.env.EMAIL_HOST || "NOT SET"}`
      );
      console.log(
        `📧 [DEBUG] EMAIL_USER: ${process.env.EMAIL_USER || "NOT SET"}`
      );
      console.log(
        `📧 [DEBUG] EMAIL_PASS: ${
          process.env.EMAIL_PASS
            ? "***" + process.env.EMAIL_PASS.slice(-4)
            : "NOT SET"
        }`
      );
      console.log(
        `📧 [DEBUG] EMAIL_FROM: ${process.env.EMAIL_FROM || "NOT SET"}`
      );
      console.log(`📧 [DEBUG] NODE_ENV: ${process.env.NODE_ENV}`);

      // Show all environment variables that start with EMAIL_ or SENDGRID_
      const emailVars = Object.keys(process.env).filter((key) =>
        key.startsWith("EMAIL_") || key.startsWith("SENDGRID_")
      );
      console.log(
        `📧 [DEBUG] Found ${emailVars.length} email environment variables:`,
        emailVars
      );

      // Priority 1: Try SendGrid (best for Railway)
      if (process.env.SENDGRID_API_KEY && sgMail) {
        console.log("📧 SendGrid API key found, setting up SendGrid service...");
        this.setupSendGridEmail();
      }
      // Priority 2: Try SMTP (Gmail, etc.)
      else if (
        process.env.EMAIL_HOST &&
        process.env.EMAIL_USER &&
        process.env.EMAIL_PASS
      ) {
        console.log(
          "📧 SMTP credentials found, setting up SMTP email service..."
        );
        this.setupProductionEmail();
      } 
      // Priority 3: Development mode
      else if (process.env.NODE_ENV === "development") {
        console.log(
          "📧 Development mode, setting up test email service..."
        );
        this.setupDevelopmentEmail();
      } else {
        console.log(
          "📧 No email credentials found in production, using fallback service..."
        );
        this.setupFallbackService();
      }
    } catch (error) {
      console.error("❌ Email service initialization failed:", error);
    }
  }

  /**
   * Setup development email using Ethereal Email
   */
  async setupDevelopmentEmail() {
    try {
      // Create test account for development
      const testAccount = await nodemailer.createTestAccount();

      this.transporter = nodemailer.createTransport({
        host: "smtp.ethereal.email",
        port: 587,
        secure: false,
        auth: {
          user: testAccount.user,
          pass: testAccount.pass,
        },
      });

      this.isConfigured = true;
      console.log(
        "📧 Development email service configured with Ethereal Email"
      );
      console.log(`📧 Preview emails at: https://ethereal.email`);
    } catch (error) {
      console.error("❌ Development email setup failed:", error);
      this.setupFallbackService();
    }
  }

  /**
   * Setup SendGrid email service (preferred for Railway)
   */
  setupSendGridEmail() {
    try {
      console.log("📧 Setting up SendGrid email service...");
      console.log(`📧 API Key: ***${process.env.SENDGRID_API_KEY.slice(-4)}`);
      
      sgMail.setApiKey(process.env.SENDGRID_API_KEY);
      
      this.isConfigured = true;
      this.emailProvider = 'sendgrid';
      console.log("✅ SendGrid email service configured successfully");
      
      // Test the API key
      this.testSendGridConnection();
      
    } catch (error) {
      console.error("❌ SendGrid setup failed:", error);
      console.log("📧 Falling back to SMTP...");
      this.setupProductionEmail();
    }
  }

  /**
   * Test SendGrid connection
   */
  async testSendGridConnection() {
    try {
      // SendGrid doesn't have a "test" endpoint, so we'll just verify the API key format
      if (process.env.SENDGRID_API_KEY.startsWith('SG.')) {
        console.log("✅ SendGrid API key format is valid");
      } else {
        console.log("⚠️ SendGrid API key format looks unusual");
      }
    } catch (error) {
      console.error("❌ SendGrid connection test failed:", error);
    }
  }

  /**
   * Setup production email service
   */
  setupProductionEmail() {
    try {
      console.log("📧 Setting up production email with configuration:");
      console.log(`   Host: ${process.env.EMAIL_HOST}`);
      console.log(`   Port: ${process.env.EMAIL_PORT}`);
      console.log(`   User: ${process.env.EMAIL_USER}`);
      console.log(`   Secure: ${process.env.EMAIL_SECURE}`);

      // Try Gmail SSL port 465 first (often works better on cloud platforms)
      console.log("📧 Attempting Gmail SSL connection (port 465)...");

      this.transporter = nodemailer.createTransport({
        host: process.env.EMAIL_HOST,
        port: 465, // Use SSL port instead of STARTTLS
        secure: true, // Use SSL
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASS,
        },
        // Reduced timeouts for faster fallback
        connectionTimeout: 8000, // 8 seconds
        greetingTimeout: 4000, // 4 seconds
        socketTimeout: 12000, // 12 seconds
        logger: true,
        debug: process.env.NODE_ENV === "production",
        pool: true,
        maxConnections: 3,
        maxMessages: 50,
        tls: {
          rejectUnauthorized: false,
        },
      });

      // Test the connection with timeout
      console.log("📧 Testing SMTP connection...");
      const testStart = Date.now();

      setTimeout(() => {
        if (this.transporter) {
          this.transporter.verify((error, success) => {
            const duration = Date.now() - testStart;
            if (error) {
              console.error(
                `❌ SMTP verification failed after ${duration}ms:`,
                error.message
              );
              console.log("⚠️ Continuing with fallback-enabled service");
            } else {
              console.log(`✅ SMTP connection verified in ${duration}ms`);
            }
          });
        }
      }, 100);

      this.isConfigured = true;
      console.log("📧 Production email service configured (SSL port 465)");
    } catch (error) {
      console.error("❌ Production email setup failed:", error);
      this.setupFallbackService();
    }
  }

  /**
   * Fallback service when email isn't available
   */
  setupFallbackService() {
    this.isConfigured = false;
    console.log(
      "📧 Email service running in fallback mode (codes logged to console)"
    );
  }

  /**
   * Generate verification code
   */
  generateVerificationCode() {
    return crypto.randomInt(100000, 999999).toString();
  }

  /**
   * Generate verification token for email links
   */
  generateVerificationToken() {
    return crypto.randomBytes(32).toString("hex");
  }

  /**
   * Send email verification code with enhanced logging and timeout protection
   */
  async sendVerificationCode(email, code, userHandle) {
    const startTime = Date.now();
    console.log(`📧 [START] Sending verification email to ${email}`);
    console.log(`📧 [DEBUG] Code: ${code}, Handle: ${userHandle}, Provider: ${this.emailProvider}`);

    try {
      if (!this.isConfigured) {
        console.log(
          `📧 [FALLBACK] Email service not configured - verification code for ${email}: ${code}`
        );
        return { success: true, messageId: "fallback", preview: null, code };
      }

      console.log(`📧 [CONFIG] Service is configured (${this.emailProvider}), preparing email...`);

      // Use SendGrid if configured
      if (this.emailProvider === 'sendgrid') {
        return await this.sendViaSendGrid(email, code, userHandle, startTime);
      }
      
      // Use SMTP (nodemailer) as fallback
      return await this.sendViaSMTP(email, code, userHandle, startTime);
      
    } catch (error) {
      const duration = Date.now() - startTime;
      console.error(`❌ [FAILED] Email send failed after ${duration}ms:`, error);
      
      // Fallback to console logging
      console.log(`📧 [FALLBACK] Verification code for ${email}: ${code}`);

      return {
        success: false,
        error: error.message,
        fallback: true,
        code,
        errorCode: error.code,
        duration
      };
    }
  }

  /**
   * Send email via SendGrid
   */
  async sendViaSendGrid(email, code, userHandle, startTime) {
    console.log(`📧 [SENDGRID] Sending email via SendGrid API...`);
    
    const msg = {
      to: email,
      from: process.env.EMAIL_FROM || 'ReceiptoVerse <noreply@receiptoverse.com>',
      subject: '🔐 Your ReceiptoVerse Verification Code',
      html: this.getVerificationEmailTemplate(code, userHandle),
      text: `Hi ${userHandle},\n\nYour ReceiptoVerse verification code is: ${code}\n\nThis code will expire in 10 minutes.\n\nIf you didn't request this code, please ignore this email.\n\nBest regards,\nThe ReceiptoVerse Team`,
    };

    try {
      const response = await sgMail.send(msg);
      const duration = Date.now() - startTime;
      
      console.log(`📧 [SUCCESS] SendGrid email sent in ${duration}ms`);
      console.log(`📧 [CODE] Verification code: ${code}`);
      
      return {
        success: true,
        messageId: response[0].headers['x-message-id'],
        provider: 'sendgrid',
        code,
        duration
      };
      
    } catch (error) {
      console.error(`❌ [SENDGRID] SendGrid API error:`, error);
      throw error;
    }
  }

  /**
   * Send email via SMTP (nodemailer)
   */
  async sendViaSMTP(email, code, userHandle, startTime) {
    const mailOptions = {
      from: process.env.EMAIL_FROM || "ReceiptoVerse <noreply@receiptoverse.com>",
      to: email,
      subject: "🔐 Your ReceiptoVerse Verification Code",
      html: this.getVerificationEmailTemplate(code, userHandle),
      text: `Hi ${userHandle},\n\nYour ReceiptoVerse verification code is: ${code}\n\nThis code will expire in 10 minutes.\n\nIf you didn't request this code, please ignore this email.\n\nBest regards,\nThe ReceiptoVerse Team`,
    };

    console.log(`📧 [SMTP] Attempting to send email via SMTP...`);
    console.log(`📧 [TIMEOUT] Setting 20-second timeout for email send...`);

    try {
      // Create timeout promise to prevent infinite hanging
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => {
          reject(new Error("Email send timeout after 20 seconds"));
        }, 20000);
      });

      const emailPromise = this.transporter.sendMail(mailOptions);

      // Race between email send and timeout
      const info = await Promise.race([emailPromise, timeoutPromise]);

      const duration = Date.now() - startTime;
      console.log(
        `📧 [SUCCESS] Email sent in ${duration}ms (ID: ${info.messageId})`
      );

      const previewUrl = nodemailer.getTestMessageUrl(info);
      console.log(`📧 [CODE] Verification code: ${code}`);
      if (previewUrl) {
        console.log(`📧 [PREVIEW] Email preview: ${previewUrl}`);
      }

      return {
        success: true,
        messageId: info.messageId,
        preview: previewUrl,
        code, // Always include code for development
      };
    } catch (error) {
      const duration = Date.now() - startTime;
      console.error(
        `❌ [FAILED] Email send failed after ${duration}ms:`,
        error
      );
      console.error(`❌ [ERROR_TYPE] ${error.name}: ${error.message}`);
      console.error(`❌ [ERROR_CODE] ${error.code || "NO_CODE"}`);

      // Check specific error types
      if (error.code === "ETIMEDOUT" || error.code === "ECONNECTION") {
        console.log(
          `📧 [NETWORK] Network/timeout error detected - this is common on Railway`
        );
      } else if (error.code === "EAUTH") {
        console.log(`📧 [AUTH] Authentication error - check Gmail credentials`);
      } else if (error.message.includes("timeout")) {
        console.log(
          `📧 [TIMEOUT] Custom timeout triggered - SMTP took too long`
        );
      }

      // Fallback to console logging
      console.log(`📧 [FALLBACK] Verification code for ${email}: ${code}`);

      return {
        success: false,
        error: error.message,
        fallback: true,
        code, // Include code for fallback scenarios
        errorCode: error.code,
        duration,
      };
    }
  }

  /**
   * Send welcome email after successful verification
   */
  async sendWelcomeEmail(email, userHandle) {
    try {
      if (!this.isConfigured) {
        console.log(`📧 [FALLBACK] Welcome email for ${email}`);
        return { success: true, messageId: "fallback" };
      }

      const mailOptions = {
        from:
          process.env.EMAIL_FROM || "ReceiptoVerse <noreply@receiptoverse.com>",
        to: email,
        subject: "🎉 Welcome to ReceiptoVerse!",
        html: this.getWelcomeEmailTemplate(userHandle),
        text: `Welcome to ReceiptoVerse, ${userHandle}!\n\nYour account has been successfully verified. You can now:\n\n• Create and manage digital receipts\n• Mint NFT receipts on Hedera\n• Connect with merchants\n• Track your purchases\n\nGet started: https://receiptoverse.com\n\nBest regards,\nThe ReceiptoVerse Team`,
      };

      const info = await this.transporter.sendMail(mailOptions);
      console.log(`📧 Welcome email sent to ${email}`);

      return { success: true, messageId: info.messageId };
    } catch (error) {
      console.error("❌ Failed to send welcome email:", error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Verification email HTML template
   */
  getVerificationEmailTemplate(code, userHandle) {
    return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>ReceiptoVerse Verification</title>
      <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #2563eb, #1d4ed8); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { background: #f8fafc; padding: 30px; border-radius: 0 0 10px 10px; }
        .code-box { background: white; border: 2px solid #2563eb; padding: 20px; text-align: center; border-radius: 8px; margin: 20px 0; }
        .code { font-size: 32px; font-weight: bold; color: #2563eb; letter-spacing: 4px; }
        .footer { text-align: center; margin-top: 20px; color: #64748b; font-size: 14px; }
        .button { display: inline-block; background: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 10px 0; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>🔐 ReceiptoVerse Verification</h1>
          <p>Hi ${userHandle}, welcome to the future of digital receipts!</p>
        </div>
        <div class="content">
          <h2>Verify Your Email Address</h2>
          <p>To complete your registration and start creating digital receipt NFTs, please enter this verification code:</p>
          
          <div class="code-box">
            <div class="code">${code}</div>
          </div>
          
          <p><strong>This code will expire in 10 minutes.</strong></p>
          
          <p>Once verified, you'll be able to:</p>
          <ul>
            <li>🧾 Create digital receipts as NFTs</li>
            <li>🔗 Connect with merchants on Hedera</li>
            <li>📱 Scan QR codes for instant receipts</li>
            <li>💎 Build your digital receipt collection</li>
          </ul>
          
          <p>If you didn't create a ReceiptoVerse account, please ignore this email.</p>
        </div>
        <div class="footer">
          <p>© 2025 ReceiptoVerse - Powered by Hedera Hashgraph</p>
          <p>This is an automated message, please do not reply.</p>
        </div>
      </div>
    </body>
    </html>
    `;
  }

  /**
   * Welcome email HTML template
   */
  getWelcomeEmailTemplate(userHandle) {
    return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Welcome to ReceiptoVerse</title>
      <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #059669, #10b981); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { background: #f0fdfa; padding: 30px; border-radius: 0 0 10px 10px; }
        .feature { background: white; padding: 15px; margin: 10px 0; border-radius: 8px; border-left: 4px solid #10b981; }
        .button { display: inline-block; background: #059669; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 20px 0; }
        .footer { text-align: center; margin-top: 20px; color: #64748b; font-size: 14px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>🎉 Welcome to ReceiptoVerse!</h1>
          <p>Hi ${userHandle}, your account is now verified and ready!</p>
        </div>
        <div class="content">
          <h2>You're All Set!</h2>
          <p>Congratulations! Your ReceiptoVerse account has been successfully verified. You can now enjoy all the features of our blockchain-powered receipt platform.</p>
          
          <div class="feature">
            <h3>🧾 Digital Receipt NFTs</h3>
            <p>Transform your receipts into unique NFTs on the Hedera network</p>
          </div>
          
          <div class="feature">
            <h3>🏪 Merchant Network</h3>
            <p>Connect with verified merchants for seamless transactions</p>
          </div>
          
          <div class="feature">
            <h3>📱 QR Code Integration</h3>
            <p>Instant receipt generation through QR code scanning</p>
          </div>
          
          <div class="feature">
            <h3>💎 NFT Collection</h3>
            <p>Build and showcase your digital receipt collection</p>
          </div>
          
          <div style="text-align: center;">
            <a href="https://receiptoverse.com" class="button">Start Using ReceiptoVerse</a>
          </div>
          
          <p>Need help getting started? Check out our <a href="https://receiptoverse.com/guide">Quick Start Guide</a> or contact our support team.</p>
        </div>
        <div class="footer">
          <p>© 2025 ReceiptoVerse - Powered by Hedera Hashgraph</p>
          <p>Follow us: <a href="#">Twitter</a> | <a href="#">Discord</a> | <a href="#">Telegram</a></p>
        </div>
      </div>
    </body>
    </html>
    `;
  }

  /**
   * Test email configuration
   */
  async testConnection() {
    try {
      if (!this.isConfigured) {
        return { success: false, error: "Email service not configured" };
      }

      if (this.emailProvider === 'sendgrid') {
        return { success: true, provider: 'sendgrid' };
      }

      await this.transporter.verify();
      console.log("📧 Email service connection test successful");
      return { success: true, provider: 'smtp' };
    } catch (error) {
      console.error("❌ Email connection test failed:", error);
      return { success: false, error: error.message };
    }
  }
}

// Create singleton instance
const emailService = new EmailService();

module.exports = emailService;
