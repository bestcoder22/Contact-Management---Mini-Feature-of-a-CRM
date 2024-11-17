const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const cors = require("cors");

const app = express();
const port = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(bodyParser.json());

// MongoDB Atlas connection string (Replace with your connection string)
const uri = "mongodb+srv://amrutkarsoham22:Girish%4022@cluster0.pmg5l.mongodb.net/";
mongoose.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log("MongoDB connected"))
  .catch(err => console.log(err));

// Define the Contact schema
const contactSchema = new mongoose.Schema({
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  phoneNumber: { type: String, required: true },
  company: { type: String },
  jobTitle: { type: String },
});

// Create the Contact model
const Contact = mongoose.model("Contact", contactSchema);

// API Endpoints

// POST: Create a new contact
app.post("/contacts", async (req, res) => {
  try {
    const { firstName, lastName, email, phoneNumber, company, jobTitle } = req.body;
    
    // Validation
    if (!firstName || !lastName || !email || !phoneNumber) {
      return res.status(400).json({ message: "All fields are required!" });
    }
    
    const existingContact = await Contact.findOne({ email });
    if (existingContact) {
      return res.status(400).json({ message: "Contact with this email already exists!" });
    }

    const newContact = new Contact({ firstName, lastName, email, phoneNumber, company, jobTitle });
    await newContact.save();
    res.status(201).json(newContact);
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
});

// GET: Retrieve all contacts
app.get("/contacts", async (req, res) => {
  try {
    const contacts = await Contact.find();
    res.status(200).json(contacts);
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
});

// PUT: Update a contact by ID
app.put("/contacts/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { firstName, lastName, email, phoneNumber, company, jobTitle } = req.body;

    // Validation
    if (!firstName || !lastName || !email || !phoneNumber) {
      return res.status(400).json({ message: "All fields are required!" });
    }

    const updatedContact = await Contact.findByIdAndUpdate(id, { firstName, lastName, email, phoneNumber, company, jobTitle }, { new: true });
    if (!updatedContact) {
      return res.status(404).json({ message: "Contact not found" });
    }
    res.status(200).json(updatedContact);
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
});

// DELETE: Delete a contact by ID
app.delete("/contacts/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const deletedContact = await Contact.findByIdAndDelete(id);
    if (!deletedContact) {
      return res.status(404).json({ message: "Contact not found" });
    }
    res.status(200).json({ message: "Contact deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
});

// Start the server
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
