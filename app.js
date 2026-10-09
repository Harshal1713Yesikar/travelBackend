const express = require("express");
const app = express();
const cors = require("cors");
const PORT = 3001;
const bcrypt = require("bcrypt");
const connectDB = require("./config/db");
const UserModel = require("./modal/Login");
const FlightModal = require("./modal/Flight");
const ContactUsModal = require("./modal/ContactUs");
const RegsiterModal = require("./modal/Register");
const UserSubscription = require("./modal/Subcribe");
const DestinationBooking = require("./modal/Bookings");
const hotelBookings = require("./modal/Hotelbooking");
const jwt = require("jsonwebtoken");

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

connectDB();

const dotenv = require("dotenv");
const Groq = require("groq-sdk");

dotenv.config();

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

app.use(
  cors({
    origin: ["http://localhost:3000", "https://jadoo-yatra.netlify.app"],
    methods: ["GET", "POST", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  }),
);

app.options("*", cors());

app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Methods", "GET,POST,PUT,DELETE,OPTIONS");
  res.header("Access-Control-Allow-Headers", "Content-Type, Authorization");
  next();
});

app.post("/api/chat", async (req, res) => {
  try {
    const { messages } = req.body;

    if (!messages || !Array.isArray(messages)) {
      return res.status(400).json({
        error: "Messages are required",
      });
    }

    if (messages.length === 0) {
      return res.status(400).json({
        error: "At least one message is required",
      });
    }

    const completion = await groq.chat.completions.create({
      model: "openai/gpt-oss-20b",

      messages: [
        {
          role: "system",
          content: `
You are Jadoo AI, the travel assistant for the Jadoo travel website.

You help users with:
- Hotels
- Flights
- Destinations
- Trip planning
- Travel tips
- Itineraries
- Travel budgets

IMPORTANT:
Return ONLY valid JSON.
Do not use markdown.
Do not use code fences.
Do not add any text before or after the JSON.

Always return exactly this structure:

{
  "reply": "your response",
  "action": null
}

There are 3 possible actions.

--------------------------------
1. HOTEL SEARCH
--------------------------------

If the user wants to search, find, or look for hotels:

{
  "reply": "Sure! I can help you search hotels in Mumbai.",
  "action": {
    "type": "hotel_search",
    "destination": "Mumbai"
  }
}

Use hotel_search when the user says things like:
- hotel
- hotels
- hotel search
- hotel room
- stay
- place to stay
- accommodation

--------------------------------
2. FLIGHT SEARCH
--------------------------------

If the user wants to search, find, or look for flights:

{
  "reply": "Sure! I can help you search flights from Mumbai to Dubai.",
  "action": {
    "type": "flight_search",
    "from": "Mumbai",
    "to": "Dubai"
  }
}

Use flight_search when the user says things like:
- flight
- flights
- flight search
- fly
- plane ticket
- flight ticket

Only create flight_search when both departure and destination are known.

If one is missing, ask the user for the missing location and return action null.

--------------------------------
3. DESTINATION SEARCH
--------------------------------

If the user wants to explore, see, open, visit, discover, or check a specific destination:

{
  "reply": "Sure! Let's explore Goa.",
  "action": {
    "type": "destination_search",
    "destination": "Goa"
  }
}

Use destination_search when the user says things like:
- destination
- destinations
- explore
- discover
- places to visit
- visit
- travel to
- show me
- see destination
- destination dekhna hai
- destination explore karna hai

--------------------------------
EXAMPLES
--------------------------------

User:
"Mujhe Mumbai mein hotel chahiye"

Return:
{
  "reply": "Sure! I can help you search hotels in Mumbai.",
  "action": {
    "type": "hotel_search",
    "destination": "Mumbai"
  }
}

User:
"Mumbai me hotel search karo"

Return:
{
  "reply": "Sure! I can help you search hotels in Mumbai.",
  "action": {
    "type": "hotel_search",
    "destination": "Mumbai"
  }
}

User:
"Mumbai se Dubai flight search karo"

Return:
{
  "reply": "Sure! I can help you search flights from Mumbai to Dubai.",
  "action": {
    "type": "flight_search",
    "from": "Mumbai",
    "to": "Dubai"
  }
}

User:
"Mumbai se flight chahiye"

Return:
{
  "reply": "Sure! Mumbai se flight ke liye destination city bataiye.",
  "action": null
}

User:
"Mujhe Goa destination dekhna hai"

Return:
{
  "reply": "Sure! Let's explore Goa.",
  "action": {
    "type": "destination_search",
    "destination": "Goa"
  }
}

User:
"Goa explore karna hai"

Return:
{
  "reply": "Sure! Let's explore Goa.",
  "action": {
    "type": "destination_search",
    "destination": "Goa"
  }
}

User:
"Goa ghoomne jaana hai"

Return:
{
  "reply": "Sure! Let's explore Goa.",
  "action": {
    "type": "destination_search",
    "destination": "Goa"
  }
}

User:
"Mujhe India ke best destinations batao"

Return:
{
  "reply": "India has many amazing destinations such as Goa, Kerala, Rajasthan, Kashmir and Himachal Pradesh.",
  "action": null
}

User:
"India me ghoomne ke liye best jagah kaunsi hai?"

Return:
{
  "reply": "India me Goa, Kerala, Kashmir, Rajasthan aur Himachal Pradesh bahut popular destinations hain.",
  "action": null
}

--------------------------------
IMPORTANT RULES
--------------------------------

- Create an action when the user clearly wants to open/search/explore a specific hotel, flight, or destination.
- Destination requests must use destination_search.
- Hotel requests must use hotel_search.
- Flight requests must use flight_search.
- General travel questions must have action null.
- Never claim that a booking has been completed.
- Never say that you have actually booked a hotel or flight.
- Keep replies short and useful.
- Reply in the same language as the user.
- destination/from/to must contain only the place name.
- Do not put extra explanation inside action fields.
- Return valid JSON only.
          `,
        },

        ...messages,
      ],

      temperature: 0.2,
      max_completion_tokens: 500,
    });

    const rawReply =
      completion.choices?.[0]?.message?.content?.trim() || "{}";

    console.log("🤖 AI RAW RESPONSE:", rawReply);

    let aiResponse;

    try {
      aiResponse = JSON.parse(rawReply);

      // Safety check
      if (!aiResponse.reply) {
        aiResponse.reply = "How can I help you with your travel plans?";
      }

      if (!Object.prototype.hasOwnProperty.call(aiResponse, "action")) {
        aiResponse.action = null;
      }

    } catch (parseError) {
      console.error("❌ JSON Parse Error:", parseError);
      console.error("Raw AI Response:", rawReply);

      aiResponse = {
        reply: rawReply,
        action: null,
      };
    }

    return res.status(200).json(aiResponse);

  } catch (error) {
    console.error("❌ Groq Error:", error);

    return res.status(500).json({
      error: "AI response failed",
    });
  }
});



app.post("/hotelbooking", async (req, res) => {
  try {
    const {
      firstname,
      lastname,
      email,
      phone,
    } = req.body;

    if (!firstname || !lastname || !email || !phone) {
      return res.status(400).json({
        error: "All fields are required",
      });
    }

    const hoteldata = new hotelBookings(req.body);

    await hoteldata.save();

    return res.status(201).json({
      message: "Booking successful",
      booking: hoteldata,
    });

  } catch (error) {
    console.error("Hotel Booking Error:", error);

    return res.status(500).json({
      error: "Something went wrong, please try again later",
    });
  }
});

app.post("/hotelbooking", async (req, res) => {
  try {
    const { firstname, lastname, email, phone } = req.body;

    if (!firstname || !lastname || !email || !phone) {
      return res.status(400).json({ error: "All fields are required" });
    }

    const hoteldata = new hotelBookings(req.body);
    await hoteldata.save();

    return res.status(201).json({
      message: "Booking successful",
      booking: hoteldata,
    });
  } catch (error) {
    return res.status(500).json({
      error: "Something went wrong, please try again later",
    });
  }
});

app.post("/contactUs", async (req, res) => {
  try {
    const { name, email, message } = req.body;
    const UserData = new ContactUsModal({ name, email, message });
    await UserData.save();
    res.json({ message: "Request received successfully!" });
  } catch (error) {
    console.error("Something Error", error);
  }
});

app.post("/api/bookings", async (req, res) => {
  try {
    const booking = new DestinationBooking(req.body);
    const savedBooking = await booking.save();
    res.status(201).json(savedBooking);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to save booking" });
  }
});

app.delete("/deleteDestination/:userId", async (req, res) => {
  try {
    const { userId } = req.params;

    const deleteDesti = await DestinationBooking.findByIdAndDelete(userId);

    if (!deleteDesti) {
      return res.status(404).json({ msg: "Destination not found" });
    }

    res.status(200).json({
      msg: "Destination Deleted Successfully",
      deleted: deleteDesti,
    });
  } catch (error) {
    console.error("Delete Error:", error);
    res.status(500).json({ msg: "Internal Server Error" });
  }
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
    return res.status(201).json({
      success: true,
      msg: "Successfully subscribed! Check your email for exclusive deals.",
      data: {
        email: newSubscription.email,
        subscribedAt: newSubscription.subscribedAt,
      },
    });
  } catch (error) {
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

    await newUser.save();

    const token = jwt.sign(
      { email: newUser.email, userid: newUser._id },
      "your_secret_key",
      { expiresIn: "1h" },
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
    res.status(500).json({ msg: "Internal Server Error" });
  }
});

app.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await UserModel.findOne({ email: email.toLowerCase() });

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
      { expiresIn: "1h" },
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
    res.status(500).json({ msg: "Internal Server Error" });
  }
});

app.get("/getData", async (req, res) => {
  try {
    const ReadData = await RegsiterModal.find();
    res.status(200).json(ReadData);
  } catch (error) {
    res.status(500).json({ msg: "Internal Server Error " });
  }
});

app.post("/update", async (req, res) => {
  try {
    const { userId, newEmail } = req.body;

    if (!userId || !newEmail) {
      return res
        .status(400)
        .json({ msg: "User ID and new email are required" });
    }

    // Normalize email
    const normalizedEmail = newEmail.toLowerCase().trim();

    const updateData = await RegsiterModal.findOneAndUpdate(
      { _id: userId },
      { email: normalizedEmail },
      { new: true, runValidators: true },
    );

    if (!updateData) {
      return res.status(404).json({ msg: "User not found" });
    }

    res.status(200).json({
      msg: "Email updated successfully",
      user: updateData,
    });
  } catch (error) {
    res.status(500).json({ msg: "Internal Server Error" });
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

    res
      .status(200)
      .json({ msg: "User Deleted Successfully", user: DeleteData });
  } catch (error) {
    res.status(500).json({ msg: "Internal Server Error" });
  }
});

app.post("/flight", async (req, res) => {
  try {
    const { city, arrivalCity, date, number, returnDate } = req.body;

    if (!city || !arrivalCity || !date || !number) {
      return res.status(400).json({ msg: "All fields are required" });
    }

    if (tripType === "round-trip" && !returnDate) {
      return res
        .status(400)
        .json({ msg: "Return date is required for round-trip." });
    }

    const UserData = new FlightModal({
      city,
      arrivalCity,
      date,
      number,
      returnDate,
    });
    await UserData.save();

    return res.status(201).json({
      message: "Flight registered successfully!",
      data: UserData,
    });
  } catch (error) {
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
  } catch (error) {
    console.error("Something Error", error);
  }
});

app.listen(PORT, () => {
  console.log("Server Running");
});
