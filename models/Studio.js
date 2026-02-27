// models/Studio.js
const mongoose = require('mongoose');


const studioSchema = new mongoose.Schema({
  studioName: String,
  registeredAddress: String,
  contactNumber: String,
  contactEmail: String,
  gstNumber: String,
  panNumber: String,
  aadharNumber: String,
  bankAccountNumber: String,
  bankIfscCode: String,
  studioIntroduction: String,
  studioWebsite: String,
  studioFacebook: String,
  studioYoutube: String,
  studioInstagram: String,
  logoUrl: String,
  aadharFrontUrl: String,
  aadharBackUrl: String,
studioPhotos: {
    type: [String],   // ✅ multiple URLs
    default: []
  },
});


module.exports = mongoose.model('Studio', studioSchema);
