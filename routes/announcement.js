const express = require('express');
const mongoose = require('mongoose');
const router = express.Router();

const Transaction = mongoose.models.Transaction || mongoose.model('Transaction',
  new mongoose.Schema(
    { studentId: mongoose.Schema.Types.ObjectId, batchId: mongoose.Schema.Types.ObjectId },
    { timestamps: true, collection: 'transactions' }
  )
);

const DCUser = mongoose.models.DCUser || mongoose.model('DCUser',
  new mongoose.Schema(
    { enrolled_batches: [{ type: mongoose.Schema.Types.ObjectId }] },
    { collection: 'users' }
  )
);

const DCBatch = mongoose.models.DCBatch || mongoose.model('DCBatch',
  new mongoose.Schema(
    { studioId: mongoose.Schema.Types.ObjectId },
    { collection: 'batches' }
  )
);

/* ===============================
   Announcement Schema
================================ */
const announcementSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  message: {
    type: String,
    required: true
  },
  studioId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Studio",
    required: true
  },
  batchId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Batch",
    default: null
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const Announcement =
  mongoose.models.Announcement ||
  mongoose.model("Announcement", announcementSchema);


/* ===============================
   Create Announcement
================================ */
router.post("/", async (req, res) => {
  try {
    const { title, message, batchId, studioId } = req.body;

    if (!title || !message || !studioId) {
      return res.status(400).json({
        success: false,
        message: "Title, message and studioId are required"
      });
    }

    const announcement = new Announcement({
      title,
      message,
      studioId,
      batchId: batchId || null
    });

    await announcement.save();

    res.status(201).json({
      success: true,
      message: "Announcement created successfully",
      data: announcement
    });

  } catch (error) {

    console.error("❌ Error creating announcement:", error);

    res.status(500).json({
      success: false,
      message: "Failed to create announcement"
    });

  }
});


/* ===============================
   Get All Announcements (Admin)
================================ */
router.get("/", async (req, res) => {

  try {

    const { studioId } = req.query;

    if (!studioId) {
      return res.status(400).json({
        success: false,
        message: "studioId is required"
      });
    }

    const announcements = await Announcement
      .find({ studioId })
      .sort({ createdAt: -1 });

    res.status(200).json(announcements);

  } catch (error) {

    console.error("❌ Failed to fetch announcements:", error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch announcements"
    });

  }

});


/* ===============================
   Get All Announcements For Student
   Across all enrolled batches, filtered by enrollment date
================================ */
router.get("/student/:userId", async (req, res) => {
  try {
    const { userId } = req.params;

    const user = await DCUser.findById(userId).lean();
    if (!user || !user.enrolled_batches?.length) return res.status(200).json([]);

    const transactions = await Transaction.find({ studentId: userId }).lean();

    // Build map: batchId -> earliest enrollment date
    const enrolledAtMap = {};
    for (const txn of transactions) {
      const batchId = txn.batchId?.toString();
      if (!batchId) continue;
      const txnDate = new Date(txn.createdAt || 0);
      if (!enrolledAtMap[batchId] || txnDate < enrolledAtMap[batchId]) {
        enrolledAtMap[batchId] = txnDate;
      }
    }

    const batches = await DCBatch.find({ _id: { $in: user.enrolled_batches } }).lean();

    const results = await Promise.all(
      batches.map(async (batch) => {
        const batchId = batch._id.toString();
        const enrolledAt = enrolledAtMap[batchId];
        if (!enrolledAt) return [];

        return Announcement.find({
          studioId: batch.studioId?.toString(),
          $or: [{ batchId: null }, { batchId: batchId }],
          createdAt: { $gte: enrolledAt },
        }).sort({ createdAt: -1 }).lean();
      })
    );

    const seen = new Set();
    const unique = results.flat().filter(a => {
      const key = a._id.toString();
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });

    unique.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    res.status(200).json(unique);

  } catch (error) {
    console.error("❌ Error fetching student announcements:", error);
    res.status(500).json({ success: false, message: "Failed to fetch announcements" });
  }
});


/* ===============================
   Get Announcements For Student
   (General + Batch Specific)
================================ */
router.get("/student/:studioId/:batchId", async (req, res) => {

  try {

    const { studioId, batchId } = req.params;

    let batchObjectId = null;

    if (mongoose.Types.ObjectId.isValid(batchId)) {
      batchObjectId = new mongoose.Types.ObjectId(batchId);
    }

    const announcements = await Announcement.find({
      studioId,
      $or: [
        { batchId: null },
        { batchId: batchObjectId }
      ]
    }).sort({ createdAt: -1 });

    res.status(200).json(announcements);

  } catch (error) {

    console.error("❌ Error fetching student announcements:", error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch announcements"
    });

  }

});


/* ===============================
   Delete Announcement
================================ */
router.delete("/:id", async (req, res) => {

  try {

    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid announcement ID"
      });
    }

    const deleted = await Announcement.findByIdAndDelete(id);

    if (!deleted) {
      return res.status(404).json({
        success: false,
        message: "Announcement not found"
      });
    }

    res.json({
      success: true,
      message: "Announcement deleted successfully"
    });

  } catch (error) {

    console.error("❌ Error deleting announcement:", error);

    res.status(500).json({
      success: false,
      message: "Failed to delete announcement"
    });

  }

});

module.exports = router;