
const mongoose = require("mongoose");
const ContactUsSchema = new mongoose.Schema({
  name: String,
  email: String,
  message: String
});

module.exports = mongoose.model("ContactUs", ContactUsSchema);
