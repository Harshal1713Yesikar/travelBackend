const mongoose = require("mongoose");

const connectDB = async () => {
 mongoose
  .connect("mongodb+srv://harshal1713yesikar:G0E1u36keaRUCwDP@traval-web.q3ifuj9.mongodb.net/UserData?retryWrites=true&w=majority&appName=Traval-web", {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  
  .then(() => console.log("MongoDB Atlas connected successfully"))
  .catch((err) => console.error("MongoDB connection error:", err));
};
module.exports = connectDB;
