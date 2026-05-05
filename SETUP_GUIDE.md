# 🏠 Property Rental Platform - Complete Setup Guide

## 📋 Table of Contents
1. [Quick Start](#quick-start)
2. [Razorpay Setup](#razorpay-setup)
3. [WhatsApp Business API Setup](#whatsapp-business-api-setup)
4. [Email Configuration](#email-configuration)
5. [Airbnb Calendar Sync](#airbnb-calendar-sync)
6. [Deployment](#deployment)
7. [Testing](#testing)

---

## 🚀 Quick Start

### Step 1: Install Dependencies

```bash
# Navigate to your project folder
cd /path/to/your/project

# Install Node.js dependencies
npm install

# Create your environment file
cp .env.example .env
```

### Step 2: Configure Environment Variables

Edit the `.env` file with your actual credentials (see sections below for how to get them)

### Step 3: Start the Server

```bash
# Development mode (auto-restart on changes)
npm run dev

# Production mode
npm start
```

Server will run on `http://localhost:3000`

### Step 4: Open Admin Dashboard

Open `admin.html` in your browser to manage bookings.

---

## 💳 Razorpay Setup (Payment Gateway)

### Why Razorpay?
- Most popular in India
- Supports UPI, cards, wallets, net banking
- Instant settlements
- No setup fee, only 2% transaction fee

### Setup Steps:

1. **Create Account**
   - Go to https://razorpay.com
   - Click "Sign Up" → Choose "Business Account"
   - Complete KYC with your business details

2. **Get API Keys**
   - Login to Razorpay Dashboard
   - Go to Settings → API Keys
   - Click "Generate Test Key" (for testing)
   - Copy `Key ID` and `Key Secret`

3. **Add to .env File**
   ```
   RAZORPAY_KEY_ID=rzp_test_XXXXXXXXXXXXXX
   RAZORPAY_KEY_SECRET=YYYYYYYYYYYYYYYY
   ```

4. **Test Payment Flow**
   - Use test card: 4111 1111 1111 1111
   - Any future expiry date
   - Any CVV

5. **Go Live**
   - Complete full KYC verification
   - Submit business documents
   - Generate "Live Keys" (not test keys)
   - Replace in .env with live keys

### Razorpay Webhook (Optional but Recommended)

To automatically verify payments:

1. Go to Razorpay Dashboard → Settings → Webhooks
2. Add webhook URL: `https://yourdomain.com/api/razorpay-webhook`
3. Select events: `payment.captured`, `payment.failed`
4. Copy webhook secret and add to .env

---

## 📱 WhatsApp Business API Setup

### Method 1: Meta WhatsApp Business API (Official - Recommended)

1. **Create Meta Business Account**
   - Go to https://business.facebook.com
   - Create a business account

2. **Set Up WhatsApp Business App**
   - Go to https://developers.facebook.com
   - Create new app → Select "Business" type
   - Add "WhatsApp" product

3. **Get Test Number** (Free for testing)
   - In WhatsApp settings, you get a test number
   - Add your personal WhatsApp to receive test messages

4. **Get Permanent Number** (For production)
   - Verify your business
   - Add your business phone number
   - Complete verification process

5. **Get API Credentials**
   - Copy `Access Token` from WhatsApp → Getting Started
   - Copy `Phone Number ID`

6. **Add to .env**
   ```
   WHATSAPP_API_TOKEN=YOUR_ACCESS_TOKEN
   WHATSAPP_PHONE_ID=YOUR_PHONE_NUMBER_ID
   ```

### Method 2: Alternative Services (Easier Setup)

If Meta's process is too complex, use these alternatives:

**Twilio WhatsApp API**
- Go to https://www.twilio.com/whatsapp
- Faster approval process
- Costs: ₹0.60 per message
- Setup guide: https://www.twilio.com/docs/whatsapp/quickstart

**Gupshup**
- Indian company, easier for Indian businesses
- Go to https://www.gupshup.io/developer/whatsapp-api
- Better support for Indian verification

### Test WhatsApp Messages

```bash
# Send test message via curl
curl -X POST "https://graph.facebook.com/v18.0/YOUR_PHONE_ID/messages" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "messaging_product": "whatsapp",
    "to": "91XXXXXXXXXX",
    "type": "text",
    "text": {
      "body": "Test booking confirmation!"
    }
  }'
```

---

## 📧 Email Configuration

### Option 1: Gmail (Easiest for Testing)

1. **Enable 2-Factor Authentication**
   - Go to Google Account → Security
   - Turn on 2-Step Verification

2. **Create App Password**
   - Go to Google Account → Security → App Passwords
   - Select "Mail" and "Other (Custom name)"
   - Enter "Property Rental Platform"
   - Copy the 16-character password

3. **Add to .env**
   ```
   EMAIL_HOST=smtp.gmail.com
   EMAIL_PORT=587
   EMAIL_USER=your-email@gmail.com
   EMAIL_PASS=your-16-char-app-password
   ```

### Option 2: SendGrid (Better for Production)

1. Sign up at https://sendgrid.com (free up to 100 emails/day)
2. Create API key
3. Update .env:
   ```
   EMAIL_HOST=smtp.sendgrid.net
   EMAIL_PORT=587
   EMAIL_USER=apikey
   EMAIL_PASS=YOUR_SENDGRID_API_KEY
   ```

### Option 3: Amazon SES (Cheapest for Scale)

- $0.10 per 1000 emails
- High deliverability
- Setup guide: https://docs.aws.amazon.com/ses/

---

## 📅 Airbnb Calendar Sync

### Why Sync Calendars?

Prevents double-bookings when you list on multiple platforms:
- Your website
- Airbnb
- Booking.com
- MakeMyTrip

### Get Airbnb iCal URL

1. **For Each Property:**
   - Log into Airbnb
   - Go to Calendar → Select Property
   - Click "Availability Settings"
   - Scroll to "Calendar Sync"
   - Click "Export Calendar"
   - Copy the iCal URL (looks like: `https://www.airbnb.com/calendar/ical/12345.ics`)

2. **Add to .env**
   ```
   AIRBNB_ICAL_1=https://www.airbnb.com/calendar/ical/LISTING1.ics
   AIRBNB_ICAL_2=https://www.airbnb.com/calendar/ical/LISTING2.ics
   AIRBNB_ICAL_3=https://www.airbnb.com/calendar/ical/LISTING3.ics
   ```

### Import Your Calendar to Airbnb

1. In Airbnb Calendar Sync settings
2. Click "Import Calendar"
3. Add URL: `https://yourdomain.com/api/calendar/1.ics` (replace 1 with property ID)
4. Name it "Website Bookings"
5. Airbnb will check this URL every few hours

### Auto-Sync Setup

Add a cron job to sync every hour:

```bash
# On your server, edit crontab
crontab -e

# Add this line (runs every hour)
0 * * * * curl -X POST http://localhost:3000/api/sync-airbnb/1
```

---

## 🌍 Deployment

### Option 1: Deploy on Railway (Easiest)

1. **Create Account**
   - Go to https://railway.app
   - Sign up with GitHub

2. **Deploy**
   - Click "New Project"
   - Select "Deploy from GitHub repo"
   - Connect your repository
   - Railway auto-detects Node.js

3. **Add Environment Variables**
   - Go to your project → Variables
   - Add all variables from .env file

4. **Get Your URL**
   - Railway gives you: `https://your-app.up.railway.app`

**Cost:** Free tier includes $5/month credit (enough for small usage)

### Option 2: Deploy on Render

1. Go to https://render.com
2. "New Web Service" → Connect GitHub
3. Build command: `npm install`
4. Start command: `npm start`
5. Add environment variables

**Cost:** Free tier available

### Option 3: Deploy on AWS/DigitalOcean (Advanced)

**DigitalOcean Droplet:**
```bash
# SSH into your server
ssh root@your-server-ip

# Install Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | bash -
apt-get install -y nodejs

# Clone your code
git clone your-repo-url
cd your-repo

# Install dependencies
npm install

# Install PM2 (process manager)
npm install -g pm2

# Start server
pm2 start server.js --name property-rental

# Make it auto-start on reboot
pm2 startup
pm2 save
```

**Cost:** $6/month for basic droplet

### Frontend Deployment

**For the booking widget (HTML/CSS/JS):**

1. **Netlify (Easiest)**
   - Drag and drop your HTML file to netlify.com/drop
   - Free hosting + SSL certificate
   - Get URL: `https://your-site.netlify.app`

2. **Vercel**
   - Same as Netlify
   - Free tier with custom domain

3. **Your Own Domain**
   - Buy domain from Namecheap/GoDaddy (₹500/year)
   - Point DNS to your hosting
   - Add SSL certificate (free with Let's Encrypt)

---

## 🧪 Testing

### Test the Complete Flow

1. **Start Backend**
   ```bash
   npm start
   ```

2. **Open Frontend**
   - Open the booking widget in browser
   - Select a property
   - Choose dates
   - Fill guest details
   - Click "Proceed to payment"

3. **Test Payment**
   - Use Razorpay test card: 4111 1111 1111 1111
   - Enter any future date and CVV
   - Complete payment

4. **Check Confirmations**
   - Check email inbox
   - Check WhatsApp for confirmation message
   - Check admin dashboard for new booking

### Test Calendar Sync

```bash
# Sync Airbnb calendar for property 1
curl -X POST http://localhost:3000/api/sync-airbnb/1

# Check availability
curl http://localhost:3000/api/availability/1
```

---

## 📊 Admin Dashboard Features

Open `admin.html` to:
- ✅ View all bookings
- ✅ Filter by status/property/date
- ✅ See revenue statistics
- ✅ Sync Airbnb calendars
- ✅ Export bookings to CSV
- ✅ Manage cancellations

---

## 🔒 Security Best Practices

1. **Never Commit .env File**
   ```bash
   # Add to .gitignore
   echo ".env" >> .gitignore
   ```

2. **Use HTTPS in Production**
   - Free SSL from Let's Encrypt
   - Or use Cloudflare (free tier)

3. **Rate Limiting**
   Add to server.js:
   ```javascript
   const rateLimit = require('express-rate-limit');
   const limiter = rateLimit({
     windowMs: 15 * 60 * 1000, // 15 minutes
     max: 100 // limit each IP to 100 requests per windowMs
   });
   app.use(limiter);
   ```

4. **Validate Input**
   - Never trust user input
   - Sanitize all form data
   - Use validation libraries like `joi`

---

## 💰 Cost Breakdown

**Monthly Operating Costs:**

| Service | Free Tier | Paid (Estimated) |
|---------|-----------|------------------|
| Hosting (Railway/Render) | $5 credit/month | $7-20/month |
| Razorpay | Free | 2% per transaction |
| WhatsApp (Meta) | 1000 free msgs | ₹0.40/message after |
| Email (SendGrid) | 100/day free | $15/month (40k emails) |
| Domain | - | ₹500/year |
| SSL | Free (Let's Encrypt) | Free |
| **Total** | **₹0-500/month** | **₹2000-3000/month** |

**At 50 bookings/month @ ₹8000 avg:**
- Revenue: ₹4,00,000
- Razorpay fees (2%): ₹8,000
- Platform costs: ₹3,000
- **Net: ₹3,89,000** 🎉

---

## 🆘 Troubleshooting

### Backend won't start
```bash
# Check Node version (need 16+)
node --version

# Reinstall dependencies
rm -rf node_modules
npm install
```

### Payment failing
- Check Razorpay test keys are correct
- Test card: 4111 1111 1111 1111
- Check browser console for errors

### WhatsApp not sending
- Verify access token is valid
- Check phone number format: 91XXXXXXXXXX (no + or -)
- Check Meta Business account status

### Email not sending
- For Gmail: check app password (not regular password)
- Check "Less secure apps" is enabled (or use App Password)
- Try SendGrid instead

---

## 📞 Next Steps

1. **Week 1:** Get all API keys, test locally
2. **Week 2:** Deploy backend + frontend
3. **Week 3:** Test end-to-end with real bookings
4. **Week 4:** Add your 15 properties, go live!

## 🎯 Future Enhancements

- SMS notifications via Twilio
- Multi-language support
- Mobile app (React Native)
- Dynamic pricing based on demand
- Reviews and ratings system
- Loyalty program
- Integration with Google Calendar
- Automated check-in instructions via WhatsApp
- Photo gallery for each property
- Virtual tours (360° images)

---

**Questions? Issues?**

Create a GitHub issue or contact me at: your-email@example.com

Good luck, habibi! 🚀
