const mongoose = require('mongoose');
const router = require('express').Router();
const nodemailer = require('nodemailer'); // ✅ required to send email

// Force-clear Mongoose model cache
delete mongoose.connection.models.Batch;

// Schema
const batchSchema = new mongoose.Schema({
  batchName: { type: String, required: true, trim: true },
  trainer: { type: String, default: "", trim: true },
  branch: { type: mongoose.Schema.Types.ObjectId, ref: 'Branch', required: true },
  style: { type: mongoose.Schema.Types.ObjectId, ref: 'DanceStyle', required: true },
  level: { type: mongoose.Schema.Types.ObjectId, ref: 'DanceLevel', required: true },
  studioId: { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'Studio' },
  enrolled_students: { type: [mongoose.Schema.Types.ObjectId], ref: 'User', default: [] },
  fee: { type: String, required: true, trim: true },
  capacity: { type: String, required: true, trim: true },
  startTime: { type: String, required: true, trim: true },
  endTime: { type: String, required: true, trim: true },
  fromDate: { type: Date, required: true, trim: true },
  toDate: { type: Date, required: true, trim: true },
  days: [{ type: String, trim: true }]
}, {
  timestamps: true,
  strict: 'throw',
  versionKey: false
});

const Batch = mongoose.model('Batch', batchSchema);

// ✅ GET: All batches with optional search
router.get('/batches', async (req, res) => {
  try {
    const search = req.query.search || '';
    const batches = await Batch.find({
      batchName: { $regex: search, $options: 'i' }
    });
    res.status(200).json(batches);
  } catch (error) {
    console.error('Error fetching batches:', error);
    res.status(500).json({ message: 'Failed to fetch batches' });
  }
});

// ✅ POST: Create new batch + send email to login email
router.post('/', async (req, res) => {
  console.log("📦 Received batch data:", req.body);
  try {
    const {
      batchName, trainer, branch, style, level, studioId,
      fee, capacity, fromDate, toDate, startTime, endTime, days
    } = req.body;

    // 1. Save batch to DB
    const newBatch = new Batch({
      batchName,
      trainer,
      branch: new mongoose.Types.ObjectId(branch),
      style: new mongoose.Types.ObjectId(style),
      level: new mongoose.Types.ObjectId(level),
      studioId: new mongoose.Types.ObjectId(studioId),
      fee,
      capacity,
      fromDate,
      toDate,
      startTime,
      endTime,
      days,
      enrolled_students: []
    });

    const saved = await newBatch.save();

    // 2. Get logged in email from studio collection
    const Studio = mongoose.connection.collection('studios');
    const studio = await Studio.findOne({ _id: new mongoose.Types.ObjectId(studioId) });

    if (studio?.contactEmail) {
      try {
        const transporter = nodemailer.createTransport({
          service: 'gmail',
          auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS
          }
        });

        const emailHTML = `
          <h2>🎉 New Batch Created!</h2>
          <p><strong>Batch Name:</strong> ${batchName}</p>
          <p><strong>Trainer:</strong> ${trainer || '-'}</p>
          <p><strong>Time:</strong> ${startTime} - ${endTime}</p>
          <p><strong>Fee:</strong> ₹${fee}</p>
          <p><strong>Capacity:</strong> ${capacity}</p>
          <p><strong>Date:</strong> ${new Date(fromDate).toDateString()} to ${new Date(toDate).toDateString()}</p>
          <p><strong>Days:</strong> ${days.join(', ')}</p>
          <br/>
          <p>Thanks for using DanceCount 💃🕺</p>
        `;

        await transporter.sendMail({
          from: `"DanceCount" <${process.env.EMAIL_USER}>`,
          to: studio.contactEmail,
          subject: `📅 New Batch Created: ${batchName}`,
          html: emailHTML
        });

        console.log(`📧 Email sent to ${studio.contactEmail}`);
      } catch (emailErr) {
        console.error('❌ Email sending error:', emailErr);
        // Still continue - don't fail the main operation
      }
    }

    res.status(200).json({ message: '✅ Batch created successfully', id: saved._id });
  } catch (error) {
    console.error('❌ Error creating batch:', error);
    res.status(500).json({ message: 'Failed to create batch', error: error.message });
  }
});

// ✅ POST: Get batch by ID
router.post('/getbyid', async (req, res) => {
  try {
    const { batchId } = req.body;

    if (!batchId) {
      return res.status(400).json({ message: 'batchId is required' });
    }

    const batch = await Batch.findById(batchId).lean();
    if (!batch) {
      return res.status(404).json({ message: 'Batch not found' });
    }

    console.log("Fetched batch:", batch);
    res.status(200).json(batch);
  } catch (error) {
    console.error('❌ Error fetching batch:', error);
    res.status(500).json({ message: 'Failed to fetch batch', error: error.message });
  }
});

module.exports = router;
