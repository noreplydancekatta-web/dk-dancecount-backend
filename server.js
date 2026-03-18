// server.js
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();
const reportsRouter = require('./routes/reports');
const studioRoutes = require('./routes/studioRoutes');
const announcementRoutes = require('./routes/announcement');
const batchRoutes = require('./routes/batch_list');

const app = express();
app.use(cors());
app.use(express.json());

// DB Connect
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('✅ MongoDB Connected'))
  .catch((err) => console.error('❌ DB Error:', err));

// Routes
app.use('/uploads', express.static('/var/www/uploads'));
app.use('/api/studios', studioRoutes);
app.use("/api/reports", reportsRouter);
app.use('/announcements', announcementRoutes);
app.use('/api/batches', batchRoutes);

// Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
