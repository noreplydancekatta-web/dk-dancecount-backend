// // backend/routes/reports.js
// import express from "express";
// import mongoose from "mongoose";

// const router = express.Router();

// const Transaction = mongoose.model("Transaction", new mongoose.Schema({
//   branchId: { type: mongoose.Schema.Types.ObjectId, ref: "Branch" },
//   paymentDetails: {
//     amountPaid: Number,
//     paymentStatus: String,
//   },
//   transactionDate: Date
// }, { timestamps: true }));

// const Branch = mongoose.model("Branch", new mongoose.Schema({
//   name: String,
//   city: String,
// }));

// // Revenue by Region API
// router.get("/revenue-by-region", async (req, res) => {
//   try {
//     const { type = "branch", startDate, endDate } = req.query;

//     const match = {
//       "paymentDetails.paymentStatus": "Success"
//     };

//     // Date filter if given
//     if (startDate && endDate) {
//       match.transactionDate = {
//         $gte: new Date(startDate),
//         $lte: new Date(endDate)
//       };
//     }

//     const pipeline = [
//       { $match: match },
//       {
//         $lookup: {
//           from: "branches",
//           localField: "branchId",
//           foreignField: "_id",
//           as: "branch"
//         }
//       },
//       { $unwind: "$branch" },
//       {
//         $group: {
//           _id: type === "city" ? "$branch.city" : "$branch.name",
//           totalRevenue: { $sum: "$paymentDetails.amountPaid" },
//           transactions: { $sum: 1 }
//         }
//       },
//       { $sort: { totalRevenue: -1 } }
//     ];

//     const results = await Transaction.aggregate(pipeline);

//     const data = results.map(r => ({
//       label: r._id,
//       value: r.totalRevenue,
//       transactions: r.transactions
//     }));

//     res.json({ success: true, data });
//   } catch (err) {
//     console.error("❌ Report Error:", err);
//     res.status(500).json({ success: false, message: "Server Error" });
//   }
// });



// router.get("/revenue-by-style", async (req, res) => {
//   try {
//     const { startDate, endDate } = req.query;

//     const match = {
//       "paymentDetails.paymentStatus": "Success"
//     };

//     if (startDate && endDate) {
//       match.transactionDate = {
//         $gte: new Date(startDate),
//         $lte: new Date(endDate)
//       };
//     }

//     const pipeline = [
//       { $match: match },
//       {
//         $lookup: {
//           from: "batches",          // Join with batches collection
//           localField: "batchId",
//           foreignField: "_id",
//           as: "batch"
//         }
//       },
//       { $unwind: "$batch" },
//       {
//         $group: {
//           _id: "$batch.style",      // Group by dance style
//           totalRevenue: { $sum: "$paymentDetails.amountPaid" },
//           transactions: { $sum: 1 }
//         }
//       },
//       { $sort: { totalRevenue: -1 } }
//     ];

//     const results = await Transaction.aggregate(pipeline);

//     const data = results.map(r => ({
//       label: r._id,
//       value: r.totalRevenue,
//       transactions: r.transactions
//     }));

//     res.json({ success: true, data });
//   } catch (err) {
//     console.error("❌ Report Error:", err);
//     res.status(500).json({ success: false, message: "Server Error" });
//   }
// });

// export default router;
