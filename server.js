const express = require("express");
const fs = require("fs");
const cors = require("cors");
const bodyParser = require("body-parser");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 3000;
const eventsFile = path.join(__dirname, "data", "events.json");

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Ensure data folder & file exist
if (!fs.existsSync(path.dirname(eventsFile))) {
  fs.mkdirSync(path.dirname(eventsFile), { recursive: true });
}
if (!fs.existsSync(eventsFile)) {
  fs.writeFileSync(eventsFile, "[]");
}

// Helpers
function readEvents() {
  try {
    const data = fs.readFileSync(eventsFile, "utf8");
    return JSON.parse(data || "[]");
  } catch (err) {
    console.error("Failed to read events.json:", err);
    return [];
  }
}

function saveEvents(events) {
  fs.writeFileSync(eventsFile, JSON.stringify(events, null, 2));
}

// POST: create new event
app.post("/api/events", (req, res) => {
  const { title, description, date, location, maxAttendees } = req.body;

  if (!title || !date || !location || !maxAttendees) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  if (isNaN(maxAttendees) || maxAttendees <= 0) {
    return res.status(400).json({ error: "maxAttendees must be a positive integer" });
  }

  const newEvent = {
    eventId: "EVT-" + Date.now(),
    title,
    description: description || "",
    date,
    location,
    maxAttendees: parseInt(maxAttendees, 10),
    currentAttendees: 0,
    status: "upcoming",
  };

  const events = readEvents();
  events.push(newEvent);
  saveEvents(events);

  res.status(201).json(newEvent);
});

// GET: list all events
app.get("/api/events", (req, res) => {
  const events = readEvents();
  res.json(events);
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
