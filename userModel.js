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
  phone: {
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
  }
});

const Logged = mongoose.model("Logged", userSchema);
const query = mongoose.model("query",querySchema);
const Needy = mongoose.model("Needy", needySchema);

module.exports = { Logged,query,Needy };
