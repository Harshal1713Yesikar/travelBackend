const mongoose  = require("mongoose")

const BookingsSchema = new mongoose.Schema({
destinationId: String,
  name: String,
  image: String,
  description: String,
  price: Number,
  rating: Number,
  location: String,
  bookedAt: {
    type: Date,
    default: Date.now}
})

module.exports = mongoose.model("destinationBooking",BookingsSchema)