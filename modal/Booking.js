const { default: mongoose } = require("mongoose");
// mongoose
//   .connect("mongodb://localhost:27017/UserData")
//   .then(() => console.log("MongoDB connected successfully"))
//   .catch((err) => console.error("MongoDB connection error:", err));
 
const bookSchema = mongoose.Schema({
    name : String, 
    date : Date,
    number : Number
})

module.exports = mongoose.model("UserBooking",bookSchema)