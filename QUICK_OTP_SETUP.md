# Quick Supabase OTP Setup Checklist

Follow these steps to configure OTP verification in Supabase:

## Step 1: Enable Email Provider (Required)

1. Go to **Supabase Dashboard** → **Authentication** → **Providers**
2. Find **Email** provider
3. Toggle **ON**
4. Enable **Confirm email** ✅

## Step 2: Configure Email Template (Required)

1. Go to **Authentication** → **Email Templates**
2. Select **Magic Link** template (used for OTP)
3. Update the template:

**Subject:**
```
Verify Your Email - SharePost
```

**Body:**
```html
<h2>Verify Your Email</h2>
<p>Your OTP code is: <strong>{{ .Token }}</strong></p>
<p>This code will expire in 10 minutes.</p>
<p>If you didn't request this code, please ignore this email.</p>
```

## Step 3: Run Database Migration (Required)

Run this SQL in **Supabase SQL Editor**:

```sql
-- This is already in 01_users_authentication.sql
-- Just make sure you've run that file
```

## Step 4: Test the Flow

1. **Sign Up** with a test email
2. **Check email** for OTP code
3. **Enter OTP** in the app
4. **Verify** it works

## Common Issues

### OTP Not Received?
- Check spam folder
- Verify Email provider is enabled
- Check Supabase logs: **Logs** → **Auth Logs**

### OTP Verification Fails?
- Check if OTP expired (10 minutes)
- Verify code is exactly 6 digits
- Check database: `SELECT * FROM otp_verifications WHERE email = 'your@email.com'`

## Production Setup (Recommended)

1. **Custom SMTP**: Set up SendGrid/Mailgun in **Settings** → **Auth** → **SMTP**
2. **Rate Limiting**: Configure in **Authentication** → **Settings** → **Rate Limits**
3. **Email Domain**: Set up SPF/DKIM records for your domain

## That's It! 🎉

Your OTP flow should now work. The app will:
1. Send OTP when user signs up
2. User enters OTP on verification screen
3. OTP is verified and user proceeds







