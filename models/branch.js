const mongoose = require('mongoose');

const branchSchema = new mongoose.Schema({
  name: String,
  address: String,
  pincode: String,
  area: String,
  mapLink: String,
  country: String,
  state: String,
  city: String,
  image: String,
contactNo: {
    type: String,
    required: true,      // ✅ optional: add if you want it mandatory
    trim: true,
  },
  studioId: { type: mongoose.Schema.Types.ObjectId, ref: 'Studio' , required: true },
}, { timestamps: true }, { collection: 'branches' });

  
 

module.exports = mongoose.models.Branch || mongoose.model('Branch', branchSchema);
