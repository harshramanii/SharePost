# Supabase OTP Configuration Guide

This guide explains how to configure Supabase for OTP (One-Time Password) email verification in your SharePost application.

## Overview

When a user registers:
1. User signs up with email and password
2. OTP is sent to their email
3. User navigates to OTP Verification screen
4. User enters OTP code
5. OTP is verified and user proceeds to Personal Details screen

## Required Supabase Configurations

### 1. Enable Email Provider

1. Go to your Supabase Dashboard
2. Navigate to **Authentication** > **Providers**
3. Find **Email** provider
4. Toggle it **ON**
5. Configure the following settings:

#### Email Provider Settings:
- **Enable email provider**: ✅ Enabled
- **Confirm email**: ✅ Enabled (recommended for production)
- **Secure email change**: ✅ Enabled (recommended)

### 2. Configure Email Templates

1. Go to **Authentication** > **Email Templates**
2. You'll see several email templates. For OTP, you need to configure:

#### Magic Link / OTP Email Template

This is the email sent when `signInWithOtp()` is called.

**Template Variables Available:**
- `{{ .Token }}` - The OTP code (6 digits)
- `{{ .TokenHash }}` - Hashed token
- `{{ .SiteURL }}` - Your site URL
- `{{ .Email }}` - User's email
- `{{ .RedirectTo }}` - Redirect URL (if applicable)

**Recommended Email Template:**

```html
<h2>Verify Your Email</h2>
<p>Your OTP code is: <strong>{{ .Token }}</strong></p>
<p>This code will expire in 10 minutes.</p>
<p>If you didn't request this code, please ignore this email.</p>
```

**Subject Line:**
```
Verify Your Email - SharePost
```

### 3. Email Confirmation Settings

1. Go to **Authentication** > **Settings**
2. Configure the following:

#### Email Confirmation Settings:
- **Enable email confirmations**: ✅ Enabled
- **Secure email change**: ✅ Enabled
- **Double confirm email changes**: ✅ Enabled (optional, for extra security)

#### URL Configuration:
- **Site URL**: Your app's URL (e.g., `https://yourapp.com`)
- **Redirect URLs**: Add your app's redirect URLs:
  - For mobile: `sharepost://` or your deep link scheme
  - For web: `https://yourapp.com/auth/callback`

### 4. SMTP Configuration (Optional but Recommended)

For production, configure custom SMTP instead of using Supabase's default email service:

1. Go to **Settings** > **Auth** > **SMTP Settings**
2. Enable **Custom SMTP**
3. Configure your SMTP provider (SendGrid, Mailgun, AWS SES, etc.):

```
SMTP Host: smtp.your-provider.com
SMTP Port: 587 (or 465 for SSL)
SMTP User: your-smtp-username
SMTP Password: your-smtp-password
Sender Email: noreply@yourapp.com
Sender Name: SharePost
```

### 5. Rate Limiting (Important for OTP)

1. Go to **Authentication** > **Settings** > **Rate Limits**
2. Configure rate limits to prevent abuse:

- **OTP Requests**: Limit to 5 requests per hour per email
- **Email Change Requests**: Limit to 3 requests per hour
- **Password Reset Requests**: Limit to 5 requests per hour

### 6. Database Setup

Make sure you've run the SQL migrations:

1. Run `database/supabase/01_users_authentication.sql` (creates `otp_verifications` table)
2. The `otp_verifications` table stores OTP codes for verification

### 7. Row Level Security (RLS) for OTP Table

The `otp_verifications` table should have RLS enabled. Add this policy in Supabase SQL Editor:

```sql
-- Allow inserting OTP records (for sending)
CREATE POLICY "Allow OTP creation" ON public.otp_verifications
    FOR INSERT WITH CHECK (true);

-- Allow reading OTP records for verification (within expiry time)
CREATE POLICY "Allow OTP verification" ON public.otp_verifications
    FOR SELECT USING (
        expires_at > NOW() 
        AND is_verified = false
    );

-- Allow updating OTP records (for marking as verified)
CREATE POLICY "Allow OTP update" ON public.otp_verifications
    FOR UPDATE USING (true);
```

## Testing OTP Flow

### Test Steps:

1. **Sign Up**:
   - Enter email and password
   - Click "Sign Up"
   - Should navigate to OTP screen

2. **Check Email**:
   - Check your email inbox
   - You should receive an email with OTP code
   - The code is also stored in `otp_verifications` table

3. **Verify OTP**:
   - Enter the 6-digit OTP code
   - Click "Verify"
   - Should navigate to Personal Details screen

4. **Resend OTP**:
   - Click "Resend OTP"
   - New OTP should be sent

### Debugging:

1. **Check Supabase Logs**:
   - Go to **Logs** > **Auth Logs**
   - Look for OTP send/verify events

2. **Check Database**:
   - Query `otp_verifications` table:
   ```sql
   SELECT * FROM otp_verifications 
   WHERE email = 'test@example.com' 
   ORDER BY created_at DESC;
   ```

3. **Check Email Delivery**:
   - Check spam folder
   - Verify SMTP settings if using custom SMTP
   - Check Supabase email logs

## Alternative: Custom OTP Implementation

If you want to use your own OTP system instead of Supabase's built-in OTP:

1. **Generate OTP in your backend/service**
2. **Send email via your own email service** (SendGrid, Mailgun, etc.)
3. **Store OTP in `otp_verifications` table**
4. **Verify OTP from database**

The current implementation supports both:
- Supabase's built-in OTP (via `signInWithOtp()`)
- Custom OTP stored in database

## Production Checklist

- [ ] Enable Email provider
- [ ] Configure email templates with branding
- [ ] Set up custom SMTP (recommended)
- [ ] Configure rate limiting
- [ ] Set up proper redirect URLs
- [ ] Test OTP flow end-to-end
- [ ] Monitor email delivery rates
- [ ] Set up email bounce handling
- [ ] Configure email domain authentication (SPF, DKIM)

## Troubleshooting

### OTP Not Received:
1. Check spam folder
2. Verify email provider is enabled
3. Check SMTP configuration
4. Verify email address is correct
5. Check Supabase logs for errors

### OTP Verification Fails:
1. Check if OTP is expired (10 minutes default)
2. Verify OTP code matches exactly
3. Check database for OTP record
4. Verify RLS policies allow verification

### Rate Limiting Issues:
1. Adjust rate limits in Supabase settings
2. Implement exponential backoff in app
3. Show user-friendly error messages

## Security Best Practices

1. **OTP Expiry**: Set reasonable expiry time (10 minutes recommended)
2. **Rate Limiting**: Prevent brute force attacks
3. **One-Time Use**: Mark OTP as used after verification
4. **Secure Storage**: Never log OTP codes
5. **HTTPS Only**: Always use HTTPS in production
6. **Email Validation**: Validate email format before sending OTP

## Additional Resources

- [Supabase Auth Documentation](https://supabase.com/docs/guides/auth)
- [Supabase Email Templates](https://supabase.com/docs/guides/auth/auth-email-templates)
- [Supabase SMTP Configuration](https://supabase.com/docs/guides/auth/auth-smtp)







