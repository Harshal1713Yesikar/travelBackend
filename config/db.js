const mongoose = require("mongoose");

const connectDB = async () => {
  mongoose
    .connect("mongodb+srv://harshal1713yesikar:G0E1u36keaRUCwDP@traval-web.q3ifuj9.mongodb.net/UserData")
    .then(() => console.log("MongoDB Connected Successfully"))
    .catch((err) => console.log("DB Error:", err));
};

module.exports = connectDB;
