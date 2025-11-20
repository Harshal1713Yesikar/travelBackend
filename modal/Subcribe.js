const { default: mongoose } = require("mongoose");
const userSubSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  isActive: { type: Boolean, default: true },
  subscribedAt: { type: Date, default: Date.now }
});
module.exports = mongoose.model("UserSubscription", userSubSchema);