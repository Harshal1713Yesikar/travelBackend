const { default: mongoose } = require("mongoose");

// mongoose.connect("mongodb://localhost:27017/UserData")
// .then(() => console.log("MongoDB connected successfully"))
// .catch((err) => console.error("MongoDB connection error:", err));

const UserSchema = mongoose.Schema({
    name: { type: String, required: true },
    username: { type: String, required: true },
    email: { type: String, required: true, unique: true,lowercase:true },
    password: { type: String, required: true }
})

module.exports = mongoose.model("user",UserSchema)