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
    // verification status
    aadharCardVerified: { type: Boolean, default: false },
    aadharNumberVerified: { type: Boolean, default: false },
    panCardVerified: { type: Boolean, default: false },
    panNumberVerified: { type: Boolean, default: false },
    rcCardVerified: { type: Boolean, default: false },
    rcnumberVerified: { type: Boolean, default: false },
    licenseCardVerified: { type: Boolean, default: false },
    licenseNumberVerified: { type: Boolean, default: false },
    allVerificationStatus: { type: Boolean, default: false },
    // captain location tracking to display the map
    captainLocation: {
      type: {
        type: String,
        enum: ["Point"],
      },
      coordinates: {
        type: [Number],
      },
    },
  },
  { timestamps: true }
);

const UserModel = mongoose.model("User", userSchema);
export default UserModel;
