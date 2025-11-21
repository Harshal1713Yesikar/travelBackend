const mongoose = require("mongoose");
const flightSchema = new mongoose.Schema({
  city: { type: String, required: true },
  arrivalCity: { type: String, required: true },
  date: { type: String, required: true },
  returnDate: { type: String },  
  number: { type: Number, required: true },
});
const FlightModal = mongoose.model("FlightUser", flightSchema);
module.exports = FlightModal;
