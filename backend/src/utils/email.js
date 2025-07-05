import nodemailer from 'nodemailer';
import { query } from '../config/database.js';

// Create email transporter
const createTransporter = () => {
  if (process.env.NODE_ENV === 'production') {
    // Production email configuration
    return nodemailer.createTransporter({
      host: process.env.EMAIL_HOST,
      port: process.env.EMAIL_PORT,
      secure: process.env.EMAIL_PORT == 465, // true for 465, false for other ports
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    });
  } else {
    // Development - use Ethereal Email for testing
    return nodemailer.createTransporter({
      host: 'smtp.ethereal.email',
      port: 587,
      auth: {
        user: 'ethereal.user@ethereal.email',
        pass: 'ethereal.pass'
      }
    });
  }
};

// Get email template from database
const getEmailTemplate = async (templateName) => {
  try {
    const result = await query(
      'SELECT * FROM email_templates WHERE name = $1 AND is_active = true',
      [templateName]
    );
    return result.rows[0] || null;
  } catch (error) {
    console.error('Error fetching email template:', error);
    return null;
  }
};

// Replace variables in template
const replaceTemplateVariables = (content, variables) => {
  let processedContent = content;
  
  Object.keys(variables).forEach(key => {
    const regex = new RegExp(`{{${key}}}`, 'g');
    processedContent = processedContent.replace(regex, variables[key] || '');
  });
  
  return processedContent;
};

// Send email using template
export const sendTemplateEmail = async (templateName, to, variables = {}) => {
  try {
    const template = await getEmailTemplate(templateName);
    if (!template) {
      throw new Error(`Email template '${templateName}' not found`);
    }

    const transporter = createTransporter();
    
    const subject = replaceTemplateVariables(template.subject, variables);
    const htmlContent = replaceTemplateVariables(template.html_content, variables);
    const textContent = template.text_content 
      ? replaceTemplateVariables(template.text_content, variables)
      : htmlContent.replace(/<[^>]*>/g, ''); // Strip HTML for text version

    const mailOptions = {
      from: `"Tours App" <${process.env.EMAIL_FROM || 'noreply@tours.com'}>`,
      to: to,
      subject: subject,
      text: textContent,
      html: htmlContent
    };

    const info = await transporter.sendMail(mailOptions);
    
    console.log('Email sent successfully:', info.messageId);
    return { success: true, messageId: info.messageId };
    
  } catch (error) {
    console.error('Error sending email:', error);
    return { success: false, error: error.message };
  }
};

// Send booking confirmation email
export const sendBookingConfirmation = async (booking, user) => {
  const variables = {
    user_name: `${user.first_name} ${user.last_name}`,
    booking_reference: booking.booking_reference,
    booking_type: booking.booking_type,
    guest_name: booking.guest_name,
    number_of_guests: booking.number_of_guests,
    total_price: booking.total_price,
    departure_date: booking.departure_date || '',
    check_in_date: booking.check_in_date || '',
    check_out_date: booking.check_out_date || '',
    special_requests: booking.special_requests || 'None',
    booking_date: new Date(booking.created_at).toLocaleDateString(),
    support_email: process.env.SUPPORT_EMAIL || 'support@tours.com',
    website_url: process.env.FRONTEND_URL || 'http://localhost:5173'
  };

  return await sendTemplateEmail('booking_confirmation', user.email, variables);
};

// Send booking cancellation email
export const sendBookingCancellation = async (booking, user) => {
  const variables = {
    user_name: `${user.first_name} ${user.last_name}`,
    booking_reference: booking.booking_reference,
    booking_type: booking.booking_type,
    cancellation_date: new Date().toLocaleDateString(),
    support_email: process.env.SUPPORT_EMAIL || 'support@tours.com',
    website_url: process.env.FRONTEND_URL || 'http://localhost:5173'
  };

  return await sendTemplateEmail('booking_cancellation', user.email, variables);
};

// Send password reset email
export const sendPasswordResetEmail = async (email, resetToken) => {
  const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`;
  
  const variables = {
    reset_url: resetUrl,
    reset_token: resetToken,
    expiry_time: '10 minutes',
    support_email: process.env.SUPPORT_EMAIL || 'support@tours.com',
    website_url: process.env.FRONTEND_URL || 'http://localhost:5173'
  };

  return await sendTemplateEmail('password_reset', email, variables);
};

// Send welcome email
export const sendWelcomeEmail = async (user) => {
  const variables = {
    user_name: `${user.first_name} ${user.last_name}`,
    user_email: user.email,
    login_url: `${process.env.FRONTEND_URL}/login`,
    website_url: process.env.FRONTEND_URL || 'http://localhost:5173',
    support_email: process.env.SUPPORT_EMAIL || 'support@tours.com'
  };

  return await sendTemplateEmail('welcome', user.email, variables);
};

// Send review request email
export const sendReviewRequest = async (booking, user) => {
  const variables = {
    user_name: `${user.first_name} ${user.last_name}`,
    booking_reference: booking.booking_reference,
    booking_type: booking.booking_type,
    review_url: `${process.env.FRONTEND_URL}/bookings/${booking.id}/review`,
    website_url: process.env.FRONTEND_URL || 'http://localhost:5173'
  };

  return await sendTemplateEmail('review_request', user.email, variables);
};

// Send admin notification email
export const sendAdminNotification = async (subject, message, data = {}) => {
  const adminEmails = process.env.ADMIN_EMAILS?.split(',') || ['admin@tours.com'];
  
  const variables = {
    subject: subject,
    message: message,
    data: JSON.stringify(data, null, 2),
    timestamp: new Date().toISOString(),
    admin_url: `${process.env.FRONTEND_URL}/admin`
  };

  const results = [];
  for (const email of adminEmails) {
    const result = await sendTemplateEmail('admin_notification', email.trim(), variables);
    results.push({ email: email.trim(), ...result });
  }
  
  return results;
};

// Send custom email (without template)
export const sendCustomEmail = async (to, subject, htmlContent, textContent = null) => {
  try {
    const transporter = createTransporter();
    
    const mailOptions = {
      from: `"Tours App" <${process.env.EMAIL_FROM || 'noreply@tours.com'}>`,
      to: to,
      subject: subject,
      text: textContent || htmlContent.replace(/<[^>]*>/g, ''),
      html: htmlContent
    };

    const info = await transporter.sendMail(mailOptions);
    
    console.log('Custom email sent successfully:', info.messageId);
    return { success: true, messageId: info.messageId };
    
  } catch (error) {
    console.error('Error sending custom email:', error);
    return { success: false, error: error.message };
  }
};

// Create default email templates
export const createDefaultEmailTemplates = async () => {
  const templates = [
    {
      name: 'welcome',
      subject: 'Welcome to Tours - Your Adventure Begins Here!',
      html_content: `
        <h1>Welcome to Tours, {{user_name}}!</h1>
        <p>Thank you for joining our community of travel enthusiasts.</p>
        <p>Your account has been created successfully with email: <strong>{{user_email}}</strong></p>
        <p>You can now:</p>
        <ul>
          <li>Browse amazing trips and hotels</li>
          <li>Make bookings with ease</li>
          <li>Leave reviews and share your experiences</li>
          <li>Create your wishlist of dream destinations</li>
        </ul>
        <p><a href="{{login_url}}" style="background-color: #2563eb; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Start Exploring</a></p>
        <p>If you have any questions, feel free to contact us at {{support_email}}</p>
        <p>Happy travels!<br>The Tours Team</p>
      `,
      variables: JSON.stringify(['user_name', 'user_email', 'login_url', 'website_url', 'support_email'])
    },
    {
      name: 'booking_confirmation',
      subject: 'Booking Confirmed - {{booking_reference}}',
      html_content: `
        <h1>Booking Confirmation</h1>
        <p>Dear {{user_name}},</p>
        <p>Your {{booking_type}} booking has been confirmed!</p>
        
        <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h2>Booking Details</h2>
          <p><strong>Booking Reference:</strong> {{booking_reference}}</p>
          <p><strong>Guest Name:</strong> {{guest_name}}</p>
          <p><strong>Number of Guests:</strong> {{number_of_guests}}</p>
          <p><strong>Total Price:</strong> ${{total_price}}</p>
          {{#if departure_date}}<p><strong>Departure Date:</strong> {{departure_date}}</p>{{/if}}
          {{#if check_in_date}}<p><strong>Check-in Date:</strong> {{check_in_date}}</p>{{/if}}
          {{#if check_out_date}}<p><strong>Check-out Date:</strong> {{check_out_date}}</p>{{/if}}
          <p><strong>Special Requests:</strong> {{special_requests}}</p>
          <p><strong>Booking Date:</strong> {{booking_date}}</p>
        </div>
        
        <p>We're excited to have you travel with us!</p>
        <p>If you have any questions, contact us at {{support_email}}</p>
        <p>Best regards,<br>The Tours Team</p>
      `,
      variables: JSON.stringify(['user_name', 'booking_reference', 'booking_type', 'guest_name', 'number_of_guests', 'total_price', 'departure_date', 'check_in_date', 'check_out_date', 'special_requests', 'booking_date', 'support_email', 'website_url'])
    },
    {
      name: 'password_reset',
      subject: 'Reset Your Password - Tours',
      html_content: `
        <h1>Password Reset Request</h1>
        <p>You requested a password reset for your Tours account.</p>
        <p>Click the button below to reset your password:</p>
        <p><a href="{{reset_url}}" style="background-color: #dc2626; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Reset Password</a></p>
        <p>This link will expire in {{expiry_time}}.</p>
        <p>If you didn't request this reset, please ignore this email.</p>
        <p>For security reasons, please don't share this link with anyone.</p>
        <p>If you have any questions, contact us at {{support_email}}</p>
      `,
      variables: JSON.stringify(['reset_url', 'reset_token', 'expiry_time', 'support_email', 'website_url'])
    }
  ];

  for (const template of templates) {
    try {
      await query(`
        INSERT INTO email_templates (name, subject, html_content, variables, is_active)
        VALUES ($1, $2, $3, $4, $5)
        ON CONFLICT (name) DO UPDATE SET
          subject = EXCLUDED.subject,
          html_content = EXCLUDED.html_content,
          variables = EXCLUDED.variables,
          updated_at = CURRENT_TIMESTAMP
      `, [template.name, template.subject, template.html_content, template.variables, true]);
    } catch (error) {
      console.error(`Error creating template ${template.name}:`, error);
    }
  }
  
  console.log('Default email templates created/updated successfully');
};

// Test email configuration
export const testEmailConfiguration = async () => {
  try {
    const transporter = createTransporter();
    await transporter.verify();
    console.log('Email configuration is valid');
    return true;
  } catch (error) {
    console.error('Email configuration error:', error);
    return false;
  }
};

export default {
  sendTemplateEmail,
  sendBookingConfirmation,
  sendBookingCancellation,
  sendPasswordResetEmail,
  sendWelcomeEmail,
  sendReviewRequest,
  sendAdminNotification,
  sendCustomEmail,
  createDefaultEmailTemplates,
  testEmailConfiguration
};
