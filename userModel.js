const mongoose = require('mongoose');

mongoose.connect("mongodb+srv://Tushar_110704:2dc1pkOsEx7yJyXz@cluster0.drxa4k1.mongodb.net/HopeFoundation?retryWrites=true&w=majority&appName=Cluster0")


const userSchema = new mongoose.Schema({
  name: String,
  email: String,
  password: String
});

const querySchema = new mongoose.Schema({
  name:String,
  email:String,
  message:String
})

const needySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  phone: {
    type: String,
    required: true
  },
  password: {
    type: String,
    required: true
  },
  story: {
    type: String,
    required: true
  },
  income: {
    type: Number,
    required: true
  },
  address: {
    type: String,
    required: true
  },
  photo: {
    type: String,
    default: ""
  }
}, { timestamps: true });


const donationSchema = new mongoose.Schema({
  donorName: {
    type: String,
    required: true
  },
  donorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Logged", // Logged user schema (donor)
    required: true
  },
  amount: {
    type: Number,
    required: true
  },
  cause: {
    type: String,
    enum: ["Education", "Healthcare", "Environment", "Fighting Hunger"],
    required: true
  },
  frequency: {
    type: String,
    enum: ["One-time", "Recurring"],
    required: true
  },
  paymentMethod: {
    type: String,
    enum: ["PhonePe", "Razorpay", "PayPal"],
    required: true
  },
  donatedAt: {
    type: Date,
    default: Date.now
  }
});

const Logged = mongoose.model("Logged", userSchema);
const query = mongoose.model("query",querySchema);
const Needy = mongoose.model("Needy", needySchema);
const Donation = mongoose.model("Donation", donationSchema);

module.exports = { Logged,query,Needy ,Donation};
