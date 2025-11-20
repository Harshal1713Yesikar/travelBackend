const { default: mongoose } = require("mongoose");
const UserSchema = mongoose.Schema({
    name: { type: String, required: true },
    username: { type: String, required: true },
    email: { type: String, required: true, unique: true,lowercase:true },
    password: { type: String, required: true }
})

module.exports = mongoose.model("user",UserSchema)