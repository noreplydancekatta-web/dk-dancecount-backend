const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');
require('dotenv').config();

// Import routes
const userRoutes = require('./routes/user_api');
const studentDetailsRoutes = require('./routes/studentdetails');
const batchRoutes = require('./routes/Batch');           
const batchListRoutes = require('./routes/batch_list');  
const batchDetailsRoute = require('./routes/batch_details');
const countryRoutes = require('./routes/country_api');
const stateRoutes = require('./routes/state_api');
const cityRoutes = require('./routes/city_api');
const branchRoutes = require('./routes/branch_api');
const studioRoutes = require('./routes/studioRoutes');
const announcementRoutes = require('./routes/announcement');
const metaRoutes = require('./routes/meta');
const branchesListRouter = require('./routes/branch_list');
const updateBatchRoute = require('./routes/batch_update');
const deleteBatchRoute = require('./routes/delete_batch'); 
const batchFetchingRoute=require('./routes/batch_fetching');
const updateBranchRoute = require('./routes/update_branch');
const deleteBranchRoute = require('./routes/delete_branch');
//const reportsRoutes = require('./routes/reports');
const studentRoutes = require('./routes/students');

const app = express();
app.use(cors());
app.use(bodyParser.json({ limit: '30mb' }));
app.use(bodyParser.urlencoded({ extended: true, limit: '30mb' }));

// ✅ MongoDB connection
const PORT = process.env.PORT || 4000;
const uri = process.env.MONGO_URI;

mongoose.connect(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => console.log('✅ MongoDB Connected'))
.catch(err => console.error('❌ MongoDB Error:', err));

// ✅ Serve all uploaded files
app.use('/uploads', express.static(path.join('/var/www/uploads')));

// ✅ Register Routes
app.use('/students', userRoutes);
app.use('/studentdetails', studentDetailsRoutes);
app.use('/api/batches', batchRoutes);
app.use('/batchlist', batchListRoutes);
app.use('/batchdetails', batchDetailsRoute);
app.use('/api/country', countryRoutes);
app.use('/api/state', stateRoutes);
app.use('/api/city', cityRoutes);
app.use('/api/branch', branchRoutes);
app.use('/api/studios', studioRoutes);
app.use('/announcements', announcementRoutes);
app.use('/api', metaRoutes);
app.use('/api/branches', branchesListRouter);
app.use('/api', updateBatchRoute); 
app.use('/api', deleteBatchRoute);
app.use('/api', batchFetchingRoute);
app.use('/api/branch', updateBranchRoute);
app.use('/api/branch', deleteBranchRoute);
//app.use('/api/reports', reportsRoutes);
app.use('/api/students', studentRoutes);
app.use('/batchdetails', batchDetailsRoute);

// ✅ Start Server
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
