require('dotenv').config();
const express = require('express');
const cors = require('cors');
const nodemailer = require('nodemailer');
const fs = require('fs').promises;
const path = require('path');

const app = express();
app.use(cors());
app.use(express.json());

// ============================================
// EMAIL SETUP
// ============================================

const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 587,
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

// ============================================
// BOOKINGS FILE
// ============================================

const BOOKINGS_FILE = path.join(__dirname, 'bookings.json');

async function loadBookings() {
  try {
    const data = await fs.readFile(BOOKINGS_FILE, 'utf-8');
    return JSON.parse(data);
  } catch {
    return [];
  }
}

async function saveBooking(bookingData) {
  const bookings = await loadBookings();
  const booking = {
    id: `BK${Date.now().toString().slice(-6)}`,
    ...bookingData,
    status: 'pending_payment',
    createdAt: new Date().toISOString()
  };
  bookings.push(booking);
  await fs.writeFile(BOOKINGS_FILE, JSON.stringify(bookings, null, 2));
  return booking;
}

// ============================================
// SEND EMAIL
// ============================================

async function sendEmail(bookingData) {
  const emailHTML = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      
      <div style="background: linear-gradient(135deg, #185FA5, #378ADD); padding: 30px; border-radius: 10px; text-align: center;">
        <h1 style="color: white; margin: 0;">Booking Received! 🏠</h1>
        <p style="color: white; opacity: 0.9;">Premium Stays - Greater Noida</p>
      </div>

      <div style="background: #f9f9f9; padding: 30px; border-radius: 10px; margin-top: 20px;">
        <p>Dear <strong>${bookingData.name}</strong>,</p>
        <p>Thank you for your booking! Please complete payment to confirm your stay.</p>

        <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h2 style="margin-top: 0; color: #185FA5;">Booking Details</h2>
          <table style="width: 100%; border-collapse: collapse;">
            <tr style="border-bottom: 1px solid #eee;">
              <td style="padding: 10px; color: #666;">Booking ID</td>
              <td style="padding: 10px; font-weight: bold;">#${bookingData.bookingId}</td>
            </tr>
            <tr style="border-bottom: 1px solid #eee;">
              <td style="padding: 10px; color: #666;">Property</td>
              <td style="padding: 10px; font-weight: bold;">${bookingData.property}</td>
            </tr>
            <tr style="border-bottom: 1px solid #eee;">
              <td style="padding: 10px; color: #666;">Check-in</td>
              <td style="padding: 10px; font-weight: bold;">${bookingData.checkin}</td>
            </tr>
            <tr style="border-bottom: 1px solid #eee;">
              <td style="padding: 10px; color: #666;">Check-out</td>
              <td style="padding: 10px; font-weight: bold;">${bookingData.checkout}</td>
            </tr>
            <tr style="border-bottom: 1px solid #eee;">
              <td style="padding: 10px; color: #666;">Guests</td>
              <td style="padding: 10px; font-weight: bold;">${bookingData.guests}</td>
            </tr>
            <tr>
              <td style="padding: 10px; color: #666; font-size: 18px;">Total Due</td>
              <td style="padding: 10px; font-weight: bold; font-size: 18px; color: #185FA5;">Rs.${bookingData.total}</td>
            </tr>
          </table>
        </div>

        <div style="background: #fff3e0; padding: 20px; border-radius: 8px; border-left: 4px solid #f57c00;">
          <h3 style="margin-top: 0; color: #f57c00;">Payment Details</h3>
          <p><strong>Please pay within 24 hours to confirm your booking:</strong></p>
          <ul style="line-height: 2;">
            <li><strong>UPI ID:</strong> your-upi@okaxis</li>
            <li><strong>Google Pay / PhonePe:</strong> +91-XXXXXXXXXX</li>
            <li><strong>Bank Transfer:</strong><br>
              Account Name: Your Business Name<br>
              Account Number: XXXXXXXXXXXX<br>
              IFSC: XXXXXXXX<br>
              Bank: Your Bank
            </li>
          </ul>
          <p style="color: #d84315;"><strong>After payment, please WhatsApp the screenshot to +91-XXXXXXXXXX</strong></p>
        </div>

        <div style="margin-top: 20px;">
          <h3>What happens next?</h3>
          <ul style="line-height: 2;">
            <li>Pay using any method above</li>
            <li>Send payment screenshot on WhatsApp</li>
            <li>We confirm your booking within 1 hour</li>
            <li>You receive property address and check-in details</li>
          </ul>
        </div>

        <p style="margin-top: 20px;">For any questions, call us at <strong>+91-XXXXXXXXXX</strong></p>
      </div>

      <div style="text-align: center; color: #999; margin-top: 20px; font-size: 12px;">
        <p>Premium Stays Greater Noida | Greater Noida, UP, India</p>
      </div>
    </div>
  `;

  await transporter.sendMail({
    from: `"Premium Stays Noida" <${process.env.EMAIL_USER}>`,
    to: bookingData.email,
    subject: `Booking Received - ${bookingData.property} (#${bookingData.bookingId})`,
    html: emailHTML
  });

  console.log('Email sent to:', bookingData.email);
}

// ============================================
// ROUTES
// ============================================

app.get('/', (req, res) => {
  res.json({ message: 'Property Rental Server is running!' });
});

app.post('/api/create-booking', async (req, res) => {
  try {
    console.log('New booking received:', req.body);
    const booking = await saveBooking(req.body);
    await sendEmail({ ...req.body, bookingId: booking.id });
    res.json({
      success: true,
      bookingId: booking.id,
      message: 'Booking saved! Email sent to customer.'
    });
  } catch (error) {
    console.error('Error:', error.message);
    res.status(500).json({ success: false, error: error.message });
  }
});

app.get('/api/bookings', async (req, res) => {
  try {
    const bookings = await loadBookings();
    res.json({ success: true, bookings });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.get('/api/availability/:propertyId', async (req, res) => {
  try {
    const bookings = await loadBookings();
    const propertyBookings = bookings.filter(b => b.propertyId == req.params.propertyId);
    const bookedDates = [];
    propertyBookings.forEach(booking => {
      let current = new Date(booking.checkin);
      const end = new Date(booking.checkout);
      while (current <= end) {
        bookedDates.push(current.toISOString().split('T')[0]);
        current.setDate(current.getDate() + 1);
      }
    });
    res.json({ success: true, bookedDates: [...new Set(bookedDates)] });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.post('/api/update-booking', async (req, res) => {
  try {
    const { bookingId, status } = req.body;
    const bookings = await loadBookings();
    const index = bookings.findIndex(b => b.id === bookingId);
    if (index === -1) return res.status(404).json({ success: false, error: 'Booking not found' });
    bookings[index].status = status;
    await fs.writeFile(BOOKINGS_FILE, JSON.stringify(bookings, null, 2));
    res.json({ success: true, message: 'Booking updated!' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// ============================================
// START SERVER
// ============================================

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log('');
  console.log('Server running on port', PORT);
  console.log('Open in browser: http://localhost:' + PORT);
  console.log('Email configured as:', process.env.EMAIL_USER || 'NOT SET - check your .env file!');
  console.log('');
});
