# Configure Supabase to Send OTP Codes in Email

This guide shows you how to configure Supabase to send 6-digit OTP codes in emails instead of confirmation links.

## Step 1: Configure Email Template in Supabase

1. **Go to Supabase Dashboard**
   - Navigate to: **Authentication** → **Email Templates**

2. **Select "Magic Link" Template**
   - This template is used for OTP emails
   - Click on **"Magic Link"** template

3. **Update the Email Template**

   Replace the template content with this:

   **Subject Line:**
   ```
   Verify Your Email - SharePost
   ```

   **Email Body (HTML):**
   ```html
   <h2>Verify Your Email</h2>
   <p>Your OTP code is: <strong>{{ .Token }}</strong></p>
   <p>This code will expire in 10 minutes.</p>
   <p>If you didn't request this code, please ignore this email.</p>
   ```

   **Important:** 
   - Use `{{ .Token }}` to display the 6-digit OTP code
   - Do NOT use `{{ .ConfirmationURL }}` (that's for magic links)
   - The `{{ .Token }}` variable contains the 6-digit OTP code

4. **Save the Template**
   - Click **"Save"** to apply changes

## Step 2: Verify Email Provider Settings

1. **Go to Authentication → Providers**
2. **Enable Email Provider**
   - Toggle **Email** to **ON**
   - Make sure **"Confirm email"** is enabled ✅

## Step 3: Test the OTP Flow

1. **Sign Up** with a test email
2. **Check your email** - you should receive:
   - Subject: "Verify Your Email - SharePost"
   - Body: Contains a 6-digit code like "123456"
3. **Enter the code** in the OTP verification screen
4. **Verify** it works

## How It Works

When you call `signInWithOtp()`:
- Supabase generates a 6-digit OTP code
- Sends it via email using your configured template
- The `{{ .Token }}` in the template is replaced with the actual OTP code
- User enters the code in your app
- You verify it using `verifyOtp()`

## Email Template Variables

Available variables in Supabase email templates:
- `{{ .Token }}` - The 6-digit OTP code (use this!)
- `{{ .TokenHash }}` - Hashed version of token
- `{{ .SiteURL }}` - Your site URL
- `{{ .Email }}` - User's email address
- `{{ .RedirectTo }}` - Redirect URL (if provided)

## Example Email Template (Full)

```html
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: Arial, sans-serif; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .otp-code { 
      font-size: 32px; 
      font-weight: bold; 
      color: #6366F1; 
      letter-spacing: 8px;
      text-align: center;
      padding: 20px;
      background: #f3f4f6;
      border-radius: 8px;
      margin: 20px 0;
    }
  </style>
</head>
<body>
  <div class="container">
    <h2>Verify Your Email</h2>
    <p>Hello,</p>
    <p>Please use the following code to verify your email address:</p>
    <div class="otp-code">{{ .Token }}</div>
    <p>This code will expire in 10 minutes.</p>
    <p>If you didn't request this code, please ignore this email.</p>
    <p>Best regards,<br>SharePost Team</p>
  </div>
</body>
</html>
```

## Troubleshooting

### OTP Not Received?
1. Check spam folder
2. Verify email template uses `{{ .Token }}` (not `{{ .ConfirmationURL }}`)
3. Check Supabase logs: **Logs** → **Auth Logs**
4. Verify email provider is enabled

### Wrong Code Format?
- Make sure you're using `{{ .Token }}` (with dot)
- The token is automatically a 6-digit code
- No need to format it

### Code Not Working?
- Check if code is expired (10 minutes default)
- Verify you're using `verifyOtp()` method (not custom verification)
- Check Supabase auth logs for errors

## Production Recommendations

1. **Custom SMTP**: Set up your own SMTP (SendGrid, Mailgun, etc.)
   - Go to **Settings** → **Auth** → **SMTP Settings**
   - Configure your SMTP provider

2. **Email Branding**: Customize the email template with your branding
   - Add your logo
   - Match your app's colors
   - Professional design

3. **Rate Limiting**: Configure rate limits
   - **Authentication** → **Settings** → **Rate Limits**
   - Prevent abuse

4. **Email Domain**: Set up SPF/DKIM records
   - Improves email deliverability
   - Reduces spam folder placement

## That's It! 🎉

After configuring the email template with `{{ .Token }}`, your users will receive 6-digit OTP codes in their emails instead of confirmation links.







