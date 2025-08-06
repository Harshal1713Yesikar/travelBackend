const mongoose = require("mongoose");
// mongoose
//   .connect("mongodb://localhost:27017/UserData", {
//     useNewUrlParser: true,
//     useUnifiedTopology: true,
//   })
//   .then(() => console.log("MongoDB connected successfully"))
//   .catch((err) => console.error("MongoDB connection error:", err));
const flightSchema = new mongoose.Schema({
  city: String,
  arrivalCity: String,
  date: Date,
  number: String,
});
const FlightModal = mongoose.model("FlightUser", flightSchema);
module.exports = FlightModal;
