const { Schema, model } = require("mongoose");

// TODO: Please make sure you edit the User model to whatever makes sense in this case
const userSchema = new Schema(
  {
    email: {
      type: String,
      required: [true,"Email is Required"],
      unique: true,
      match: [/^\S+@\S+\.\S+$/, 'Please use a valid email address: email needs an @.'],
      trim: true,
      lowercase:true
    },
    passwordHash: {
      type: String,
      required: [true,"Password is required"],
      

    
    }
  },
  {
    // this second object adds extra properties: `createdAt` and `updatedAt`    
    timestamps: true
  }
);

const User = model("User", userSchema);

module.exports = User;

