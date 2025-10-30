const express = require("express");
const morgan = require("morgan");
const cors = require("cors");

const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
require('dotenv').config();


const { Logged ,query ,Needy } = require("./userModel");

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
    const user = new Logged({ name, email, password: hashedPassword });
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
   res.status(500).json({ error: err.message });
  }
})

app.post("/message",(req,res)=>{
  try {
    const{name,email,message} = req.body;
    console.log(req.body)
    const newQuery = query.create({
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
    const { name, phone, story, income, address } = req.body;

    // Simple validation
    if (!name || !phone || !story || !income || !address) {
      return res.status(400).json({ error: "All fields required" });
    }

    const needy = new Needy({ name, phone, story, income, address });
    await needy.save();

    res.status(201).json({ message: "Needy registration successful", needy });
  } catch (error) {
    res.status(500).json({ error: error.message });
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

  

app.listen(port, () => {
  console.log(`🚀 Server running at http://localhost:${port}`);
});


