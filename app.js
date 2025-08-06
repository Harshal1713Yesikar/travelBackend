const express = require("express");
const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
const cors = require("cors");
app.use(cors());
const PORT = 3001;
const bcrypt = require("bcrypt");
const connectDB = require("./config/db");
// Correct import paths
const UserModel = require("./modal/Login");
const FlightModal = require("./modal/Flight");
const ContactUsModal = require("./modal/ContactUs");
const BookDataModal = require("./modal/Booking");
const RegsiterModal = require("./modal/Register");
const UserSubscription = require("./modal/Subcribe");

const jwt = require("jsonwebtoken");


connectDB();
app.use(
  cors({
    origin: "http://localhost:3000",
    methods: ["POST"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  })
);

app.get("/", (req, res) => {
  res.send("Hii harshal");
});

app.post("/subscribe", async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ success: false, msg: "Email is required" });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res
        .status(400)
        .json({ success: false, msg: "Please enter a valid email address" });
    }

    const normalizedEmail = email.toLowerCase().trim();
    const existingUser = await UserSubscription.findOne({
      email: normalizedEmail,
    });

    if (existingUser) {
      if (existingUser.isActive) {
        return res
          .status(400)
          .json({ success: false, msg: "Email is already subscribed" });
      } else {
        existingUser.isActive = true;
        existingUser.subscribedAt = new Date();
        await existingUser.save();

        return res.status(200).json({
          success: true,
          msg: "Subscription reactivated successfully!",
          data: { email: existingUser.email },
        });
      }
    }

    const newSubscription = new UserSubscription({
      email: normalizedEmail,
    });
    await newSubscription.save();

    console.log(`New subscription: ${normalizedEmail}`);

    return res.status(201).json({
      success: true,
      msg: "Successfully subscribed! Check your email for exclusive deals.",
      data: {
        email: newSubscription.email,
        subscribedAt: newSubscription.subscribedAt,
      },
    });
  } catch (error) {
    console.error("Subscription error:", error);
    if (error.code === 11000) {
      return res
        .status(400)
        .json({ success: false, msg: "Email is already subscribed" });
    }
    return res.status(500).json({
      success: false,
      msg: "Something went wrong. Please try again later.",
    });
  }
});

app.post("/register", async (req, res) => {
  try {
    let { name, username, email, password } = req.body;
    email = email.toLowerCase();

    let existingUser = await RegsiterModal.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ msg: "User Already Registered" });
    }

    if (!name || !username || !email || !password) {
      return res.status(400).json({ msg: "All Fields are Required" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new RegsiterModal({
      name,
      username,
      email,
      password: hashedPassword,
    });

    console.log(newUser, "Register Created");

    await newUser.save();

    const token = jwt.sign(
      { email: newUser.email, userid: newUser._id },
      "your_secret_key",
      { expiresIn: "1h" }
    );

    res.status(201).json({
      msg: "User Registered Successfully",
      token,
      user: {
        id: newUser._id,
        name: newUser.name,
        email: newUser.email,
      },
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ msg: "Email Already Exists" });
    }
    console.error("Registration Error:", error);
    res.status(500).json({ msg: "Internal Server Error" });
  }
});

app.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    console.log(email, "email entered");

    const user = await UserModel.findOne({ email: email.toLowerCase() });
    console.log(user, "User login Successfully");

    if (!user) {
      return res.status(400).json({ msg: "User Not Found" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ msg: "User Not Found", password: isMatch });
    }
    const token = jwt.sign(
      { email: user.email, userid: user._id },
      "your_secret_key",
      { expiresIn: "1h" }
    );

    res.status(200).json({
      msg: "Login Successful",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
      },
    });
  } catch (error) {
    console.error("Login Error:", error);
    res.status(500).json({ msg: "Internal Server Error" });
  }
});

app.get("/getData", async (req, res) => {
  try {
    const ReadData = await RegsiterModal.find();
    console.log("readData", ReadData);
    res.status(200).json(ReadData);
  } catch (error) {
    console.error("Error fetching data:", error);
    res.status(500).json({ msg: "Internal Server Error " });
  }
});




app.delete("/delete/:userId", async (req, res) => {
  try {
    const { userId } = req.params;

    if (!userId) {
      return res.status(400).json({ msg: "User ID is required" });
    }

    const DeleteData = await RegsiterModal.findOneAndDelete({ _id: userId });

    if (!DeleteData) {
      return res.status(404).json({ msg: "User Not Found" });
    }

    console.log("Deleted User:", DeleteData);
    res
      .status(200)
      .json({ msg: "User Deleted Successfully", user: DeleteData });
  } catch (error) {
    console.error("Delete Error:", error);
    res.status(500).json({ msg: "Internal Server Error" });
  }
});

app.post("/contactUs", async (req, res) => {
  try {
    const { name, email, message } = req.body;
    const UserData = new ContactUsModal({ name, email, message });
    await UserData.save();
    res.json({ message: "Request received successfully!" });
    console.log("Received Request:", req.body);
    console.log(UserData, "User Sent Message");
  } catch (error) {
    console.log("Something Error", error);
  }
});

app.post("/flight", async (req, res) => {
  try {
    const { city, arrivalCity, date, number } = req.body;
    console.log("Received Data:", req.body);

    if (!city || !arrivalCity || !date || !number) {
      return res.status(400).json({ msg: "All fields are required" });
    }

    const UserData = new FlightModal({ city, arrivalCity, date, number });
    await UserData.save();

    console.log("Flight Data Saved:", UserData);
    return res.status(201).json({
      message: "Flight registered successfully!",
      data: UserData,
    });
  } catch (error) {
    console.error("Error Saving Flight Data:", error);
    return res.status(500).json({
      error: "Something went wrong, please try again later",
    });
  }
});

app.post("/book", async (req, res) => {
  try {
    const { name, date, number } = req.body;
    if (!name || !date || !number) {
      return res.status(400).json({ err: "All Feild are Requied" });
    }
    const UserData = new BookDataModal({ name, date, number });
    await UserData.save();
    res.json({ message: "Request received successfully!" });
    console.log("Received Request:", req.body);
    console.log(UserData, "User Sent Message");
  } catch (error) {
    console.log("Something Error", error);
  }
});

app.listen(PORT, () => {
  console.log("Server Running");
});
