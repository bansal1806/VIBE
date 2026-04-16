/**
 * Validate email format
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

/**
 * Check if email is a .edu domain
 */
export function isEduEmail(email: string): boolean {
  if (!isValidEmail(email)) {
    return false
  }

  const domain = email.split('@')[1]?.toLowerCase()
  return domain?.endsWith('.edu') ?? false
}

/**
 * Validate student email (must be .edu domain)
 */
export function validateStudentEmail(email: string): { valid: boolean; isEdu: boolean; error?: string } {
  if (!email) {
    return { valid: false, isEdu: false, error: 'Email is required' }
  }

  if (!isValidEmail(email)) {
    return { valid: false, isEdu: false, error: 'Invalid email format' }
  }

  const isEdu = isEduEmail(email)
  if (!isEdu) {
    return { valid: false, isEdu: false, error: 'Only .edu email addresses are allowed' }
  }

  return { valid: true, isEdu: true }
}

/**
 * Send OTP email
 */
export async function sendOTPEmail(email: string, otp: string): Promise<void> {
  // In development, log to console
  if (process.env.NODE_ENV === 'development') {
    console.log(`[DEV] OTP for ${email}: ${otp}`)
    return
  }

  // In production, use email service
  if (!process.env.SMTP_HOST && !process.env.SENDGRID_API_KEY && !process.env.AWS_SES_REGION) {
    throw new Error('Email service not configured. Please set up SMTP, SendGrid, or AWS SES.')
  }

  // Use nodemailer with SMTP
  if (process.env.SMTP_HOST) {
    // Dynamic import to avoid require() in Next.js
    const { default: nodemailer } = await import('nodemailer')

    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: process.env.SMTP_PORT === '465', // true for 465, false for other ports
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    })

    await transporter.sendMail({
      from: process.env.SMTP_FROM || 'noreply@vibe.app',
      to: email,
      subject: 'Your Vibe Verification Code',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #00FF6A; margin: 0;">Vibe</h1>
            <p style="color: #666; font-size: 14px;">Campus Connection Platform</p>
          </div>
          
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; border-radius: 12px; margin-bottom: 20px;">
            <h2 style="color: white; margin-top: 0; margin-bottom: 10px;">Your Verification Code</h2>
            <p style="color: rgba(255,255,255,0.9); margin-bottom: 20px;">Enter this code to verify your email:</p>
            
            <div style="background: white; padding: 20px; border-radius: 8px; text-align: center; margin: 20px 0;">
              <div style="font-size: 36px; font-weight: bold; color: #667eea; letter-spacing: 8px; font-family: 'Courier New', monospace;">
                ${otp}
              </div>
            </div>
            
            <p style="color: rgba(255,255,255,0.8); font-size: 14px; margin-bottom: 0;">
              This code will expire in <strong>10 minutes</strong>.
            </p>
          </div>
          
          <div style="text-align: center; color: #999; font-size: 12px;">
            <p>If you didn't request this code, please ignore this email.</p>
            <p style="margin-top: 20px;">
              <a href="${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}" style="color: #667eea; text-decoration: none;">
                Visit Vibe
              </a>
            </p>
          </div>
        </div>
      `,
      text: `Your Vibe verification code is: ${otp}\n\nThis code will expire in 10 minutes.\n\nIf you didn't request this code, please ignore this email.`,
    })
  }

  // SendGrid implementation
  if (process.env.SENDGRID_API_KEY) {
    try {
      const response = await fetch('https://api.sendgrid.com/v3/mail/send', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.SENDGRID_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          personalizations: [{
            to: [{ email }],
            subject: 'Your Vibe Verification Code',
          }],
          from: {
            email: process.env.SMTP_FROM || 'noreply@vibe.app',
            name: 'Vibe',
          },
          content: [{
            type: 'text/html',
            value: `
              <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
                <div style="text-align: center; margin-bottom: 30px;">
                  <h1 style="color: #00FF6A; margin: 0;">Vibe</h1>
                  <p style="color: #666; font-size: 14px;">Campus Connection Platform</p>
                </div>
                
                <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; border-radius: 12px; margin-bottom: 20px;">
                  <h2 style="color: white; margin-top: 0; margin-bottom: 10px;">Your Verification Code</h2>
                  <p style="color: rgba(255,255,255,0.9); margin-bottom: 20px;">Enter this code to verify your email:</p>
                  
                  <div style="background: white; padding: 20px; border-radius: 8px; text-align: center; margin: 20px 0;">
                    <div style="font-size: 36px; font-weight: bold; color: #667eea; letter-spacing: 8px; font-family: 'Courier New', monospace;">
                      ${otp}
                    </div>
                  </div>
                  
                  <p style="color: rgba(255,255,255,0.8); font-size: 14px; margin-bottom: 0;">
                    This code will expire in <strong>10 minutes</strong>.
                  </p>
                </div>
                
                <div style="text-align: center; color: #999; font-size: 12px;">
                  <p>If you didn't request this code, please ignore this email.</p>
                  <p style="margin-top: 20px;">
                    <a href="${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}" style="color: #667eea; text-decoration: none;">
                      Visit Vibe
                    </a>
                  </p>
                </div>
              </div>
            `,
          }],
        }),
      })

      if (!response.ok) {
        const errorText = await response.text()
        throw new Error(`SendGrid API error: ${response.status} - ${errorText}`)
      }

      return
    } catch (error) {
      console.error('[email] SendGrid error:', error)
      throw new Error('Failed to send email via SendGrid')
    }
  }

  // AWS SES implementation
  if (process.env.AWS_SES_REGION) {
    try {
      // Dynamic import for AWS SDK
      const { SESClient, SendEmailCommand } = await import('@aws-sdk/client-ses')

      const client = new SESClient({
        region: process.env.AWS_SES_REGION,
        credentials: {
          accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
          secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
        },
      })

      const command = new SendEmailCommand({
        Source: process.env.SMTP_FROM || 'noreply@vibe.app',
        Destination: {
          ToAddresses: [email],
        },
        Message: {
          Subject: {
            Data: 'Your Vibe Verification Code',
            Charset: 'UTF-8',
          },
          Body: {
            Html: {
              Data: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
                  <div style="text-align: center; margin-bottom: 30px;">
                    <h1 style="color: #00FF6A; margin: 0;">Vibe</h1>
                    <p style="color: #666; font-size: 14px;">Campus Connection Platform</p>
                  </div>
                  
                  <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; border-radius: 12px; margin-bottom: 20px;">
                    <h2 style="color: white; margin-top: 0; margin-bottom: 10px;">Your Verification Code</h2>
                    <p style="color: rgba(255,255,255,0.9); margin-bottom: 20px;">Enter this code to verify your email:</p>
                    
                    <div style="background: white; padding: 20px; border-radius: 8px; text-align: center; margin: 20px 0;">
                      <div style="font-size: 36px; font-weight: bold; color: #667eea; letter-spacing: 8px; font-family: 'Courier New', monospace;">
                        ${otp}
                      </div>
                    </div>
                    
                    <p style="color: rgba(255,255,255,0.8); font-size: 14px; margin-bottom: 0;">
                      This code will expire in <strong>10 minutes</strong>.
                    </p>
                  </div>
                  
                  <div style="text-align: center; color: #999; font-size: 12px;">
                    <p>If you didn't request this code, please ignore this email.</p>
                    <p style="margin-top: 20px;">
                      <a href="${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}" style="color: #667eea; text-decoration: none;">
                        Visit Vibe
                      </a>
                    </p>
                  </div>
                </div>
              `,
              Charset: 'UTF-8',
            },
            Text: {
              Data: `Your Vibe verification code is: ${otp}\n\nThis code will expire in 10 minutes.\n\nIf you didn't request this code, please ignore this email.`,
              Charset: 'UTF-8',
            },
          },
        },
      })

      await client.send(command)
      return
    } catch (error) {
      console.error('[email] AWS SES error:', error)
      throw new Error('Failed to send email via AWS SES')
    }
  }
}

