const express = require("express");
const mongoose = require("mongoose");
const router = express.Router();
const sendEmail = require("../utils/sendEmail");

const Student =
  mongoose.models.Student ||
  mongoose.model("Student", new mongoose.Schema({
    firstName: String,
    lastName: String,
    email: String,
    imageUrl: String
  }, { collection: "users" }));

const Batch =
  mongoose.models.Batch ||
  mongoose.model("Batch", new mongoose.Schema({
    batchName: String,
    trainer: String,
    branch: String,
    style: String,
    level: String,
    fee: String,
    capacity: String,
    fromDate: String,
    toDate: String,
    startTime: String,
    endTime: String,
    days: [String],
    studioId: String,
    enrolled_students: {
      type: [mongoose.Schema.Types.ObjectId],
      default: []
    }
  }, { collection: "batches" }));

router.post("/notify-batch-created", async (req, res) => {

    try {

        const { batchId, batchName, trainer, startTime, endTime, days, fee } = req.body;

        const batch = await Batch.findById(batchId);

        if (!batch) {
            return res.status(404).json({ message: "Batch not found" });
        }

        const studentIds = batch.enrolled_students;

        if (!studentIds || studentIds.length === 0) {
            return res.json({ message: "No students enrolled in this batch" });
        }

        const students = await Student.find({ _id: { $in: studentIds } });

        for (const student of students) {

            if (!student.email) continue;

            const message = `
Hello ${student.firstName},

Your batch details have been updated.

Batch: ${batchName}
Trainer: ${trainer}
Days: ${days ? days.join(", ") : ""}
Time: ${startTime} - ${endTime}
Fee: ₹${fee}

Thank you,
DanceCount Studio
`;

            await sendEmail(student.email, "Batch Update Notification", message);
        }

        res.json({ message: "Emails sent successfully" });

    } catch (error) {

        console.error("Email error:", error);
        res.status(500).json({ message: "Failed to send emails" });

    }

});

module.exports = router;