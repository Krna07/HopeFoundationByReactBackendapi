const express = require("express");
const morgan = require("morgan");
const cors = require("cors");
const { Logged ,query } = require("./userModel");

console.log(Logged,query)

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

app.post("/logged", async (req, res) => {
  try {
    const { name, email, password } = req.body;
    const user = new Logged({ name, email, password });
    await user.save();
    console.log("Saved:", name, email, password);
    res.json({ message: "User logged successfully", user });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

app.post("/login",async(req,res)=>{
  try{
    console.log(req.body)
    const {email,password} = req.body;
    const user = await Logged.findOne({email:email,password:password})
    console.log(user._id)

      res.status(200).json({ 
      message: "Login successful!", 
      data: user
  });


  }catch(err){
    res.status(500).json({ error: err.message });
  }
})

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
  

app.listen(port, () => {
  console.log(`🚀 Server running at http://localhost:${port}`);
});


