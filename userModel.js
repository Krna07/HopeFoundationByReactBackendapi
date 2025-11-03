const mongoose = require('mongoose');

mongoose.connect("mongodb+srv://Tushar_110704:2dc1pkOsEx7yJyXz@cluster0.drxa4k1.mongodb.net/HopeFoundation?retryWrites=true&w=majority&appName=Cluster0")


// const userSchema = new mongoose.Schema({
//   name: String,
//   email: String,
//   password: String
// });

const userSchema = new mongoose.Schema({
  name: String,
  email: String,
  password: String,
  profilePic: {
    type: String,
    default: "https://cdn-icons-png.flaticon.com/512/149/149071.png" // default profile pic
  }
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

// const allDonationSchema = new mongoose.Schema({
//   donatedBy: {
//     type: mongoose.Schema.Types.ObjectId,
//     ref: "Logged",      // who donated
//     required: true
//   },
//   donatedTo: {
//     type: mongoose.Schema.Types.ObjectId,
//     ref: "Needy",       // needy receiver
//     required: true
//   },
//   amount: {
//     type: Number,
//     required: true
//   },
//   donatedAt: {
//     type: Date,
//     default: Date.now
//   }
// });


const allDonationSchema = new mongoose.Schema(
  {
    donatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Logged",      // who donated
      required: true
    },
    donatedTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Needy",       // needy receiver
      required: true
    },
    amount: {
      type: Number,
      required: true
    },

    // --- NEW FIELDS TO POWER YOUR UI ---
    message: {
      type: String,
      trim: true,
      default: ""
    },

    cause: {
      type: String,
      required: true,
      default: "General Support" 
    },
    status: {
      type: String,
      enum: ["Pending", "Allocated", "Delivered", "Completed"],
      default: "Pending"
    },
    thankYouNote: {
      type: String,
      trim: true,
      default: ""
    }
  },
  {
    timestamps: true 
  }
);

const organizationSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Organization name is required'],
      trim: true,
    },
    description: {
      type: String,
      required: [true, 'Description is required'],
      trim: true,
    },
    website: {
      type: String,
      trim: true,
    },
    country: {
      type: String,
      trim: true,
    },
    email: {
      type: String,
      trim: true,
      lowercase: true,
      // Optional: Add email validation
      // match: [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, 'Please fill a valid email address']
    },
    category: {
      type: String,
      required: [true, 'Category is required'],
      trim: true,
    },
  },
  {
    // Automatically adds `createdAt` and `updatedAt` fields
    timestamps: true,
  }
);const feedbackSchema = new mongoose.Schema(
  {
    fromNeedy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Needy', // The Needy user who is writing the feedback
      required: true,
    },
    toDonor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Logged', // The Donor who will receive the feedback
      required: true,
    },
    donation: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'AllDonation', // The specific donation this feedback is for
      required: true,
    },
    note: {
      type: String,
      required: [true, 'A thank you note is required.'],
      trim: true,
    },
  },
  {
    timestamps: true, // Automatically adds createdAt and updatedAt
  }
);





const Logged = mongoose.model("Logged", userSchema);
const query = mongoose.model("query",querySchema);
const Needy = mongoose.model("Needy", needySchema);
const Donation = mongoose.model("Donation", donationSchema);
const AllDonation = mongoose.model("AllDonation", allDonationSchema);
const Organization = mongoose.model("Organization", organizationSchema);
const Feedback = mongoose.model("Feedback", feedbackSchema);

module.exports = { Logged,query,Needy ,Donation ,AllDonation ,Organization ,Feedback };
