const mongoose = require("mongoose");

const HotelSchema = new mongoose.Schema({
  firstname: { type: String, required: true },
  lastname: { type: String, required: true },
  email: { type: String, required: true },
  phone: { type: String, required: true },
  message: { type: String },
  hotelName: String,
  hotelLocation: String,
  hotelImage: String,
  guests: Number,
});

module.exports = mongoose.model("hotelBookings", HotelSchema);
