const mongoose = require("mongoose");
const flightSchema = new mongoose.Schema({
  city: String,
  arrivalCity: String,
  date: Date,
  number: String,
});
const FlightModal = mongoose.model("FlightUser", flightSchema);
module.exports = FlightModal;
