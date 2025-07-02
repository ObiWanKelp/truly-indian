const express = require("express");
const mongoose = require("mongoose");
const multer = require("multer");
const path = require("path");

const app = express();

const STATES = [
  "Andhra Pradesh",
  "Arunachal Pradesh",
  "Assam",
  "Bihar",
  "Chhattisgarh",
  "Goa",
  "Gujarat",
  "Haryana",
  "Himachal Pradesh",
  "Jharkhand",
  "Karnataka",
  "Kerala",
  "Madhya Pradesh",
  "Maharashtra",
  "Manipur",
  "Meghalaya",
  "Mizoram",
  "Nagaland",
  "Odisha",
  "Punjab",
  "Rajasthan",
  "Sikkim",
  "Tamil Nadu",
  "Telangana",
  "Tripura",
  "Uttar Pradesh",
  "Uttarakhand",
  "West Bengal",
];

// ====== MongoDB ======
mongoose
  .connect("mongodb://127.0.0.1:27017/trulyindian", {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("✅ MongoDB connected"))
  .catch((err) => console.error("❌ MongoDB error:", err));

// ====== Schema ======
const placeSchema = new mongoose.Schema({
  location: String,
  state: String,
  type: String,
  description: String,
  imageUrl: String,
});
const Place = mongoose.model("Place", placeSchema);

// ====== Multer Config ======
const storage = multer.diskStorage({
  destination: path.join(__dirname, "public/uploads"),
  filename: (req, file, cb) => {
    cb(null, Date.now() + "-" + file.originalname);
  },
});
const upload = multer({ storage });

// ====== Middleware ======
app.use(express.static(path.join(__dirname, "public")));
app.use(express.urlencoded({ extended: true }));
app.set("view engine", "ejs");

// ====== Home Route ======
app.get("/", async (req, res) => {
  const places = await Place.find();
  const grouped = {};

  for (const state of STATES) {
    grouped[state] = places.filter((p) => p.state === state);
  }

  const displayData = {};
  for (const state of STATES) {
    if (grouped[state].length > 0) {
      displayData[state] = grouped[state];
    } else {
      const safeStateName = state.replace(/\s+/g, "_");
      displayData[state] = [
        {
          imageUrl: `/uploads/${safeStateName}.jpg`,
          location: "",
          state,
          description: `No places added yet for ${state}. Be the first to add one!`,
        },
      ];
    }
  }

  res.render("home", { grouped: displayData });
});

// ====== State Route ======
app.get("/:state", async (req, res) => {
  const state = req.params.state;
  if (!STATES.includes(state)) return res.status(404).send("State not found.");
  const places = await Place.find({ state });
  res.render("state", { state, places });
});

// ====== Public Submit Route (No login needed) ======
app.get("/submit-place/user-input", (req, res) => {
  res.sendFile(path.join(__dirname, "submit-place", "user-input.html"));
});

app.post("/submit", upload.single("image"), async (req, res) => {
  const { location, state, type, description } = req.body;
  if (!STATES.includes(state)) return res.status(400).send("Invalid state.");

  const newPlace = new Place({
    location,
    state,
    type,
    description,
    imageUrl: "/uploads/" + req.file.filename,
  });

  await newPlace.save();
  res.redirect("/");
});

// ====== Server Start ======
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🚀 http://localhost:${PORT}`));
