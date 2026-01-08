# Quick Setup: Get OTP Codes in Email

## What You Need to Do

### 1. Update Supabase Email Template (2 minutes)

1. Go to **Supabase Dashboard** → **Authentication** → **Email Templates**
2. Click on **"Magic Link"** template
3. **Change the email body** to show the OTP code:

**Replace this:**
```
Click here to confirm: {{ .ConfirmationURL }}
```

**With this:**
```
Your OTP code is: {{ .Token }}
```

**Full Template Example:**
```html
<h2>Verify Your Email</h2>
<p>Your OTP code is: <strong>{{ .Token }}</strong></p>
<p>This code will expire in 10 minutes.</p>
```

4. **Save** the template

### 2. That's It! ✅

Now when users sign up:
- They'll receive an email with a 6-digit OTP code
- They enter the code in your app
- Code is verified using Supabase's built-in system

## Test It

1. Sign up with your email
2. Check your inbox
3. You should see: "Your OTP code is: 123456" (example)
4. Enter the code in the app
5. It should verify successfully!

## Troubleshooting

**Still getting confirmation links?**
- Make sure you saved the template
- Verify you're using `{{ .Token }}` (not `{{ .ConfirmationURL }}`)
- Check that Email provider is enabled

**Not receiving emails?**
- Check spam folder
- Verify email address is correct
- Check Supabase logs: **Logs** → **Auth Logs**







