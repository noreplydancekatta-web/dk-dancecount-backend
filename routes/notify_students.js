const express = require("express");
const router = express.Router();
const nodemailer = require("nodemailer");
const Batch = require("../models/Batch"); // adjust model name if different

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

router.post("/notify-batch-created", async (req, res) => {
  const { batchId, batchName, trainer, startTime, endTime, days, fee } = req.body;

  try {
    const batch = await Batch.findById(batchId)
      .populate("enrolled_students", "email name");

    if (!batch?.enrolled_students?.length) {
      return res.status(400).json({ message: "No enrolled students." });
    }

    await Promise.all(
      batch.enrolled_students.map((student) =>
        transporter.sendMail({
          from: `"Dance Studio" <${process.env.EMAIL_USER}>`,
          to: student.email,
          subject: `Batch Update: ${batchName}`,
          html: `
            <h2>Hello ${student.name},</h2>
            <p>Your batch has been updated:</p>
            <ul>
              <li><b>Batch:</b> ${batchName}</li>
              <li><b>Trainer:</b> ${trainer}</li>
              <li><b>Time:</b> ${startTime} – ${endTime}</li>
              <li><b>Days:</b> ${days.join(", ")}</li>
              <li><b>Fee:</b> ₹${fee}</li>
            </ul>
          `,
        })
      )
    );

    res.status(200).json({ message: "Emails sent." });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to send emails." });
  }
});

module.exports = router;