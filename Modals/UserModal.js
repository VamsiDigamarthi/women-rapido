import mongoose from "mongoose";
const { Schema } = mongoose;

const userSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
    },
    gender: {
      type: String,
      required: true,
    },
    mobile: {
      type: String,
      required: true,
      unique: true,
    },
    authenticationImage: {
      type: String,
    },
    role: {
      type: String,
      required: true,
    },
    onDuty: {
      type: Boolean,
      default: false,
    },
    holdingCaptain: {
      type: Boolean,
      default: false,
    },
    termsAndCondition: { type: String },
    profilePic: { type: String },
    captainLiveImage: { type: String },
    licenseImage: { type: String },
    license: { type: String },
    pan: { type: String },
    adhar: { type: String },
    rc: { type: String },
    vehicleNumber: { type: String },
  },
  { timestamps: true }
);

const UserModel = mongoose.model("User", userSchema);
export default UserModel;
