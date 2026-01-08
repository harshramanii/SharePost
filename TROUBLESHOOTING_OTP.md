# Troubleshooting: "Account created but OTP could not be sent"

If you're seeing this error, here's how to fix it:

## Common Causes & Solutions

### 1. Email Template Not Configured Correctly

**Problem:** Supabase email template is using `{{ .ConfirmationURL }}` instead of `{{ .Token }}`

**Solution:**
1. Go to **Supabase Dashboard** → **Authentication** → **Email Templates**
2. Select **"Magic Link"** template
3. Make sure the email body contains: `{{ .Token }}`
4. **NOT** `{{ .ConfirmationURL }}` (that's for magic links)

**Correct Template:**
```html
<h2>Verify Your Email</h2>
<p>Your OTP code is: <strong>{{ .Token }}</strong></p>
```

### 2. Email Provider Not Enabled

**Problem:** Email provider is disabled in Supabase

**Solution:**
1. Go to **Authentication** → **Providers**
2. Find **Email** provider
3. Toggle it **ON** ✅
4. Make sure **"Confirm email"** is enabled

### 3. User Already Exists

**Problem:** Trying to send OTP to an email that's already registered

**Solution:**
- The code now uses `shouldCreateUser: false` which should fix this
- If user exists, OTP will still be sent for verification

### 4. Check Supabase Logs

**To Debug:**
1. Go to **Supabase Dashboard** → **Logs** → **Auth Logs**
2. Look for errors related to OTP sending
3. Check the error message for details

### 5. Email Delivery Issues

**Possible Causes:**
- Email going to spam folder
- Invalid email address
- SMTP configuration issues

**Solutions:**
- Check spam/junk folder
- Verify email address is correct
- If using custom SMTP, check SMTP settings

## Quick Fix Checklist

- [ ] Email template uses `{{ .Token }}` (not `{{ .ConfirmationURL }}`)
- [ ] Email provider is enabled in Supabase
- [ ] "Confirm email" is enabled
- [ ] Check Supabase Auth Logs for errors
- [ ] Check spam folder for emails
- [ ] Verify email address is valid

## Test the Fix

1. **Update email template** with `{{ .Token }}`
2. **Enable email provider**
3. **Try signing up again**
4. **Check your email** (including spam)
5. **You should receive:** "Your OTP code is: 123456"

## Still Not Working?

### Check Console Logs

The app now logs detailed errors. Check your console for:
```
OTP send error: [error details]
```

### Common Error Messages

**"Email rate limit exceeded"**
- Wait a few minutes before trying again
- Configure rate limits in Supabase settings

**"Invalid email address"**
- Verify the email format is correct
- Check for typos

**"Email provider not configured"**
- Enable email provider in Supabase
- Check SMTP settings if using custom SMTP

## Alternative: Use Custom Email Service

If Supabase email continues to fail, you can:
1. Use SendGrid, Mailgun, or AWS SES
2. Send OTP emails via your own service
3. Store OTP in database and verify manually

See `src/services/emailService.js` for examples.







