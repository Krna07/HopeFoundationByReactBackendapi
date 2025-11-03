const express = require("express");
const morgan = require("morgan");
const cors = require("cors");


const multer = require('multer');
const storage = multer.memoryStorage();
const upload = multer({ 
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB file size limit
  fileFilter: (req, file, cb) => {
    // Only allow image mimetypes
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed!'), false);
    }
  }
});


const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
require('dotenv').config();
const mongoose = require("mongoose");
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log("✅ Connected to MongoDB"))
.catch((err) => console.error("❌ MongoDB connection error:", err));



const { Logged ,query ,Needy , Donation ,AllDonation ,Organization ,Feedback } = require("./userModel");

console.log(Logged,query,Needy)

const app = express();
const port = 5000;

app.use(cors());
app.use(morgan("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use((req, res, next) => {
  console.log("🧐 Hello from global middleware!");
  next();
});


const authMiddleware = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader)
    return res.status(401).json({ message: "No token provided" });

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.userId = decoded.id;
    next();
  } catch (err) {
    return res.status(401).json({ message: "Invalid token" });
  }
};

app.get("/validate", authMiddleware, async (req, res) => {
  console.log(req.userId)
  try {
    const user = await Logged.findById(req.userId).select("-password");
    console.log(user)

    if (!user){
      return res.status(404).json({ message: "User not found" });
    }
    userData = {
      message: "dataRegain",
      data: user
    }
    return res.json(userData);
  } catch (err) {
    return res.status(500).json({ message: "Server error" });
  }
});

app.get("/", (req, res) => {
  res.send("Hope Foundation Backend is running!");
})

// app.post("/logged", async (req, res) => {
//   try {
//     const { name, email, password } = req.body;
//     const user = new Logged({ name, email, password });
//     await user.save();
//     console.log("Saved:", name, email, password);
//     res.json({ message: "User logged successfully", user });
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ error: err.message });
//   }
// });

app.put('/profileUpdate/:id', upload.single('profilePic'), async (req, res) => {
  try {
    const { id } = req.params;
    
    // Check if a file was actually uploaded
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No file uploaded.' });
    }
    
    // Find the user in the 'Logged' collection
    const user = await Logged.findById(id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    // Save the image buffer and content type to the user's document
    user.profilePic.data = req.file.buffer;
    user.profilePic.contentType = req.file.mimetype;
    await user.save();

    // Send back the updated user data (excluding sensitive fields)
    const dataToReturn = { ...user.toObject() };
    delete dataToReturn.password; // Never send the password
    delete dataToReturn.profilePic; // Don't send the large buffer back
    
    // Add a flag for the frontend to know a pic exists
    dataToReturn.profilePicExists = true; 

    res.status(200).json({
      success: true,
      message: 'Profile picture updated!',
      data: dataToReturn, // Send the updated user data
    });

  } catch (err) {
    console.error("Error in /profileUpdate:", err);
    res.status(500).json({ success: false, message: 'Server error', error: err.message });
  }
});

// --- 2. ROUTE: Serve the Profile Picture ---
// This provides the image to the <img> tag in React
app.get('/api/profile/pic/:id', async (req, res) => {
  try {
    const user = await Logged.findById(req.params.id);

    // Check if user and picture data exist
    if (!user || !user.profilePic || !user.profilePic.data) {
      // You could send a default avatar here if you want
      return res.status(404).send('No profile picture found.');
    }

    // Set the HTTP header for the content type (e.g., 'image/jpeg')
    res.contentType(user.profilePic.contentType);
    
    // Send the raw image data (buffer) as the response
    res.send(user.profilePic.data);

  } catch (err) {
    console.error("Error in /api/profile/pic:", err);
    res.status(500).send('Server error');
  }
});

// --- 3. ROUTE: Update Profile Text Fields ---
// This handles the "Save Changes" button for name, bio, etc.
app.put('/api/profile/textUpdate/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { name, email, phone, address, bio } = req.body;
        
        // Find user by ID and update them with the new text data
        const updatedUser = await Logged.findByIdAndUpdate(
            id,
            { name, email, phone, address, bio }, 
            { new: true } // This option returns the *updated* document
        ).select('-password -profilePic'); // Exclude sensitive fields from the response

        if (!updatedUser) {
            return res.status(404).json({ success: false, message: 'User not found.' });
        }

        // Send back the updated user
        res.status(200).json({
            success: true,
            message: 'Profile updated!',
            data: updatedUser
        });

    } catch (err) {
        console.error("Error in /api/profile/textUpdate:", err);
        res.status(500).json({ success: false, message: 'Server error', error: err.message });
    }
});


app.post("/logged", async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Check if user already exists
    const existingUser = await Logged.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: "User already exists" });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Save user
    const user = new Logged({ name, email, password: hashedPassword});
    await user.save();

    res.status(201).json({ message: "User registered successfully", user });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});


// app.post("/login",async(req,res)=>{
//   try{
//     console.log(req.body)
//     const {email,password} = req.body;
//     const user = await Logged.findOne({email:email,password:password})
//     console.log(user._id)

//       res.status(200).json({ 
//       message: "Login successful!", 
//       data: user
//   });


//   }catch(err){
//     res.status(500).json({ error: err.message });
//   }
// })

app.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    // Check user exists
    const user = await Logged.findOne({ email });
    if (!user) return res.status(400).json({ error: "User not found" });

    // Compare password with hash
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ error: "Invalid credentials" });

    // Create token
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "1h",
    });

    res.status(200).json({
      message: "Login successful!",
      token, // send token to frontend
      data: { name: user.name, email: user.email, _id: user._id },
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


app.post("/dash",async(req,res)=>{
  try{
    const {id} = req.body
    console.log("from api",id)
    const user = await Logged.findOne({_id:id})
     res.status(200).json({ 
      message: "found", 
      data: user
    });

    
  }catch(error){
   res.status(500).json({ error: error.message });
  }
})

app.post("/needylogin", async (req, res) => {
  try {
    const { email, password } = req.body; 
    const user = await Needy.findOne({ email });
    if (!user) return res.status(400).json({ error: "User not found" });  
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ error: "Invalid credentials" });  
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {    
      expiresIn: "1h",  
    });  
    res.status(200).json({  
      message: "Login successful!",  
      token, 
      data: { name: user.name, email: user.email, _id: user._id },  
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post("/message",async(req,res)=>{
  try {
    const{name,email,message} = req.body;
    console.log(req.body)
    const newQuery =await query.create({
      name:name,email:email,message:message
    })
    res.status(200).json({
      message:"query will be solved soon"
    })
  } catch (error) {
    console.log(error)
    
  }
})

app.post("/needy-register", async (req, res) => {
  try {
    const { name, email, password, phone, story, income, address } = req.body;
    const existingUser = await Needy.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: "User already exists" });
    } 
    const hashedPassword = await bcrypt.hash(password, 10);
      const user = new Needy({
      name,
      email,
      phone,
      story,
      income,
      address,
      password: hashedPassword,
    });
    await user.save();
    res.status(201).json({ message: "Needy registered successfully", user });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

app.get("/needy-list", async (req, res) => {
  try {
    const needy = await Needy.find();
    res.json(needy);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});


app.post("/donate", async (req, res) => {
  try {
    const { donorId, donorName, amount, cause, frequency, paymentMethod } = req.body;

    // TODO: create Donation model first
    const donation = await Donation.create({
      donorName,
      donorId,
      amount,
      cause,
      frequency,
      paymentMethod
    });

    res.json({ message: "Donation successful", donation });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.post("/alldonation", async (req, res) => {
  try {
    const { donatedBy, donatedTo, amount } = req.body;

    let existingDonation = await AllDonation.findOne({donatedBy,donatedTo});

      if (existingDonation) { 
        existingDonation.amount = Number(existingDonation.amount) + Number(amount);
        await existingDonation.save();

        return res.json({
          success: true,
          message: "Donation updated (amount added)",
          updatedDonation: existingDonation
        });
    }

    const allDonation = await AllDonation.create({
      donatedBy,
      donatedTo,
      amount
    });
    res.json({ message: "Donation recorded", allDonation });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.get("/alldonation/:donorId", async (req, res) => {
  try {
    const { donorId } = req.params;
    const donations = await AllDonation.find({ donatedBy: donorId })
      .populate("donatedTo")
      .sort({ createdAt: -1 });
  
    res.json({
      success: true,
      data: donations.map(d => ({
        _id: d._id,
        // --- THIS IS THE FIX ---
        needyName: d.donatedTo?.name || "Anonymous", 
        amount: d.amount,
        date: d.createdAt,
        message: d.message,
        cause: d.cause, 
        status: d.status,
        thankYouNote: d.thankYouNote
      }))
    });
  } catch (err) {
    // ... (your error handling)
  } 
});


app.get("/alldonationeedy/:needyId", async (req, res) => {
  try {
    const { needyId } = req.params;

    // --- Best Practice: Validate the ID ---
    if (!mongoose.Types.ObjectId.isValid(needyId)) {
      return res.status(400).json({ 
        success: false, 
        message: "Invalid Needy ID" 
      });
    }

    // --- Find and populate ---
    const donations = await AllDonation.find({ donatedTo: needyId })
      .populate("donatedBy")
      .sort({ createdAt: -1 }); // Bonus: Sort by most recent!



    console.log(donations)

    res.json({
      success: true,
      data: donations.map(d => ({
        // --- Fix 1: Add donation ID for React keys ---
        _id: d._id, 
        
        // --- Fix 2: Handle null donors (optional chaining) ---
        donorName: d.donatedBy?.name || "Anonymous", 
        donorId: d.donatedBy?._id || null,
        
        amount: d.amount,
        
        // --- Fix 3: Add the message field ---
        message: d.message || "", // (Assuming 'message' is in your schema)
        
        date: d.createdAt
      }))
    });

  } catch (err) {
    // --- Fix 4: Add a try...catch block ---
    console.error("Error fetching donations:", err);
    res.status(500).json({ 
      success: false, 
      message: "Server error. Could not fetch donations." 
    });
  }
});


// In your main server file (e.g., server.js)
app.get("/organizations", async (req, res) => { 
  try {
    const organizations = await Organization.find(); // Assuming your model is "Organization"
    res.json({
      success: true,
      data: organizations
    });
  } catch (err) {
    res.status(500).json({ success: false, message: "Server error" });
  }
});


app.post("/feedback", async (req, res) => {
  try {
    const { fromNeedy, toDonor, donationId, note } = req.body;

    if (!fromNeedy || !toDonor || !donationId || !note) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields"
      });
    }

    // Check donation exists
    const donation = await AllDonation.findById(donationId);
    if (!donation) {
      return res.status(404).json({
        success: false,
        message: "Donation not found"
      });
    }

    const newFeedback = await Feedback.create({
      fromNeedy,
      toDonor,
      donation: donationId,
      note
    });

    // Update donation with thank-you note
    donation.thankYouNote = note;
    await donation.save();

    res.status(201).json({
      success: true,
      message: "Feedback sent successfully!",
      data: newFeedback,
    });

  } catch (err) {
    console.error("Error sending feedback:", err);
    res.status(500).json({
      success: false,
      message: "Server error. Could not send feedback."
    });
  }
});



// --- In your Express server file ---
// GET route to find all feedback for a specific donor
app.get("/feedback/donor/:donorId", async (req, res) => {
  try {
    const { donorId } = req.params;

    const feedback = await Feedback.find({ toDonor: donorId })
      .populate("fromNeedy", "name") // <-- This is the CRITICAL part
      .sort({ createdAt: -1 }); // Show newest first

    if (!feedback) {
      return res.status(404).json({
        success: false,
        message: "No feedback found for this donor."
      });
    }

    res.status(200).json({
      success: true,
      data: feedback,
    });

  } catch (err) {
    console.error("Error fetching donor feedback:", err);
    res.status(500).json({
      success: false,
      message: "Server error. Could not fetch feedback."
    });
  }
});


  

app.listen(port, () => {
  console.log(`🚀 Server running at http://localhost:${port}`);
});


