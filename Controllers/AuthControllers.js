import axios from "axios";
import OtpModel from "../Modals/OtpModal.js";
import UserModel from "../Modals/UserModal.js";
import jwt from "jsonwebtoken";

import { fileURLToPath } from "url";
import { dirname, join } from "path";
import fs from "fs";
import CitiesModel from "../Modals/CitiesModal.js";

const __dirname = dirname(fileURLToPath(import.meta.url));

// sending otp from registration
export const sendOtp = async (req, res) => {
  const { mobile } = req.body;

  if (!mobile) {
    return res.status(400).json({ message: "Mobile number is required" });
  }

  let otp;

  try {
    const otpExist = await OtpModel.findOne({ mobile: mobile });
    if (mobile === "9123456789") {
      console.log("number matches");

      otp = "123456";
      console.log(otp);
    } else {
      otp = Math.floor(100000 + Math.random() * 900000);
    }
    // const otp = Math.floor(100000 + Math.random() * 900000);
    // const otp = "123456";
    const otpApiUrl = `https://2factor.in/API/V1/${process.env.OTP_API_KEY}/SMS/+91${mobile}/${otp}/OTP TEMPLATE`;
    try {
      // Send OTP using Axios GET request
      console.log("sdfghjkl");
      await axios.get(otpApiUrl);

      if (otpExist) {
        // Update the existing OTP document
        otpExist.otp = otp;
        await otpExist.save();
      } else {
        // Create a new OTP document
        const newOtp = new OtpModel({ mobile, otp });
        await newOtp.save();
      }

      return res.status(200).json({ message: "OTP sent successfully!" });
    } catch (error) {
      console.error("Error sending OTP:", error);
      return res.status(500).json({
        message: "Sending OTP failed due to an external server error",
        error: error.message,
      });
    }
  } catch (error) {
    console.error("Error finding/updating OTP:", error);
    return res
      .status(500)
      .json({ message: "OTP send failed", error: error.message });
  }
};

// verifycation otp
export const onVerificationOtp = async (req, res) => {
  const { mobile, otp } = req.body;

  if (!mobile) {
    return res.status(400).json({ message: "Please send mobile number..!" });
  }
  if (!otp) {
    return res.status(400).json({ message: "Please send otp ..!" });
  }

  try {
    const existingOtpEntry = await OtpModel.findOne({ mobile });
    if (!existingOtpEntry) {
      return res.status(401).json({ message: "User not found in database" });
    }

    if (existingOtpEntry.otp.toString() !== otp.toString()) {
      return res.status(401).json({ message: "Invalid OTP" });
    }

    const user = await UserModel.findOne({ mobile });
    if (!user) {
      return res.status(401).json({ message: "User does not exist" });
    }

    const payload = { mobile: user.mobile };
    const token = jwt.sign(payload, process.env.JWT_TOKEN_SECRET);

    return res.status(200).json({ token });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      message: "Server error during OTP verification",
      error: error.message,
    });
  }
};

// user registration
export const onUserRegister = async (req, res) => {
  const {
    name,
    gender,
    mobile,
    role,
    termsAndCondition,
    vehicleNumber,
    dateOfBirth,
    email,
    uniqueKey,
  } = req.body;
  const authenticationImage = req.file ? req.file.path : null;
  try {
    const existingUser = await UserModel.findOne({ mobile });
    if (existingUser) {
      return res.status(400).json({ message: "User Already Exist ....!" });
    }

    const user = new UserModel({
      name,
      gender,
      mobile,
      role,
      authenticationImage,
      termsAndCondition,
      vehicleNumber,
      email,
      dateOfBirth,
      uniqueKey,
    });

    await user.save();
    const payload = { mobile: mobile };
    const token = jwt.sign(payload, process.env.JWT_TOKEN_SECRET);
    return res.status(200).json({ token });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      message: "Registration failed..!",
      error: error.message,
    });
  }
};

export const onFetchProfile = async (req, res) => {
  const { user } = req;
  try {
    return res.status(200).json(user);
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      message: "Profile failed..!",
      error: error.message,
    });
  }
};

// change roles

export const onChangeRole = async (req, res) => {
  const { user } = req;
  const { role } = req.body;
  try {
    await UserModel.findByIdAndUpdate(
      { _id: user._id },
      { $set: { role: role } },
      { new: true }
    );
    return res.status(201).json({ message: "Change role successfully....!" });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      message: "Change role failed..!",
      error: error.message,
    });
  }
};

export const onLogin = async (req, res) => {
  const { mobile } = req.body;
  try {
    const result = await UserModel.findOne({ mobile });
    if (result) {
      const payload = { mobile: mobile };
      const token = jwt.sign(payload, process.env.JWT_TOKEN_SECRET);
      return res.status(200).json({ token });
    }
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      message: "Login failed..!",
      error: error.message,
    });
  }
};

export const onEditProfile = async (req, res) => {
  const { user } = req;
  const { Name, email, dateOfBirth } = req.body;
  // const { name } = req.body;
  // console.log(Name);
  const updateData = {};
  if (Name) updateData.name = Name;
  if (email) updateData.email = email;
  if (dateOfBirth) updateData.dateOfBirth = dateOfBirth;
  const profilePic = req.file ? req.file.path : null;
  // console.log(profilePic);
  if (profilePic) updateData.profilePic = profilePic;
  try {
    if (user.profilePic) {
      const oldImagePath = join(__dirname, "..", user.profilePic);

      fs.unlink(oldImagePath, (err) => {
        if (err) {
          console.log(`Failed to delete old image: ${err}`);
        } else {
          console.log(`Deleted old image: ${user.image}`);
        }
      });
    }
    await UserModel.findByIdAndUpdate(
      { _id: user._id },
      { $set: updateData },
      { new: true }
    );

    return res
      .status(201)
      .json({ message: "Profile updated successfully ....!" });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      message: "Edit-profile  failed..!",
      error: error.message,
    });
  }
};

export const onEditUserData = async (req, res) => {
  const { user } = req;
  const { name, email, dateOfBirth } = req.body;
  const updateData = {};
  if (name) updateData.name = name;
  if (email) updateData.email = email;
  if (dateOfBirth) updateData.dateOfBirth = dateOfBirth;

  try {
    await UserModel.findByIdAndUpdate(
      { _id: user._id },
      { $set: updateData },
      { new: true }
    );

    return res
      .status(201)
      .json({ message: "Profile Updated successfully...!" });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      message: "Edit-profile  failed..!",
      error: error.message,
    });
  }
};

export const onP = async (req, res) => {
  const { mobile } = req.params;
  try {
    const result = await UserModel.findOne({ mobile });
    if (result) {
      return res.status(200).json(result);
    }
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      message: "Edit-profile  failed..!",
      error: error.message,
    });
  }
};

export const onFetchAll = async (req, res) => {
  try {
    const result = await UserModel.find({});
    if (result) {
      return res.status(200).json(result);
    }
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      message: "Edit-profile  failed..!",
      error: error.message,
    });
  }
};

export const onAadharCardVerification = async (req, res) => {
  const { user } = req;
  const { aadharCardVerified, aadharNumberVerified } = req.body;

  // Create an update object dynamically based on the request body
  const updateFields = {};
  if (aadharCardVerified !== undefined) {
    updateFields.aadharCardVerified = aadharCardVerified;
  }
  if (aadharNumberVerified !== undefined) {
    updateFields.aadharNumberVerified = aadharNumberVerified;
  }

  try {
    if (Object.keys(updateFields).length === 0) {
      return res.status(400).json({ message: "No fields to update" });
    }

    await UserModel.findByIdAndUpdate(
      user._id,
      {
        $set: updateFields,
      },
      { new: true }
    );

    return res
      .status(200)
      .json({ message: "Aadhar details updated successfully" });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      message: "Edit-profile failed..!",
      error: error.message,
    });
  }
};

export const onPanCardVerification = async (req, res) => {
  const { user } = req;
  const { panCardVerified, panNumberVerified } = req.body;

  // Create an update object dynamically based on the request body
  const updateFields = {};
  if (panCardVerified !== undefined) {
    updateFields.panCardVerified = panCardVerified;
  }
  if (panNumberVerified !== undefined) {
    updateFields.panNumberVerified = panNumberVerified;
  }

  try {
    if (Object.keys(updateFields).length === 0) {
      return res.status(400).json({ message: "No fields to update" });
    }

    await UserModel.findByIdAndUpdate(
      user._id,
      {
        $set: updateFields,
      },
      { new: true }
    );

    return res
      .status(200)
      .json({ message: "Pan details updated successfully" });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      message: "Edit-profile failed..!",
      error: error.message,
    });
  }
};

export const onRCCardVerification = async (req, res) => {
  const { user } = req;
  const { rcCardVerified, rcnumberVerified } = req.body;

  // Create an update object dynamically based on the request body
  const updateFields = {};
  if (rcCardVerified !== undefined) {
    updateFields.rcCardVerified = rcCardVerified;
  }
  if (rcnumberVerified !== undefined) {
    updateFields.rcnumberVerified = rcnumberVerified;
  }

  try {
    if (Object.keys(updateFields).length === 0) {
      return res.status(400).json({ message: "No fields to update" });
    }

    await UserModel.findByIdAndUpdate(
      user._id,
      {
        $set: updateFields,
      },
      { new: true }
    );

    return res.status(200).json({ message: "RC details updated successfully" });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      message: "Edit-profile failed..!",
      error: error.message,
    });
  }
};

export const onLicenseCardVerification = async (req, res) => {
  const { user } = req;
  const { licenseCardVerified, licenseNumberVerified } = req.body;

  // Create an update object dynamically based on the request body
  const updateFields = {};
  if (licenseCardVerified !== undefined) {
    updateFields.licenseCardVerified = licenseCardVerified;
  }
  if (licenseNumberVerified !== undefined) {
    updateFields.licenseNumberVerified = licenseNumberVerified;
  }

  try {
    if (Object.keys(updateFields).length === 0) {
      return res.status(400).json({ message: "No fields to update" });
    }

    await UserModel.findByIdAndUpdate(
      user._id,
      {
        $set: updateFields,
      },
      { new: true }
    );

    return res
      .status(200)
      .json({ message: "License details updated successfully" });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      message: "Edit-profile failed..!",
      error: error.message,
    });
  }
};

export const onAllCardVerificationStatus = async (req, res) => {
  const { user } = req;
  const { allVerificationStatus } = req.body;
  try {
    await UserModel.findByIdAndUpdate(
      user._id,
      {
        $set: { allVerificationStatus: allVerificationStatus },
      },
      { new: true }
    );
    return res
      .status(200)
      .json({ message: "All card verification status updated successfully" });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      message: "Edit-profile failed..!",
      error: error.message,
    });
  }
};

export const onFetchCities = async (req, res) => {
  try {
    const cities = await CitiesModel.find({}).select(
      "-createdAt -updatedAt -__v"
    );
    return res.status(200).json(cities);
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      message: "Edit-profile failed..!",
      error: error.message,
    });
  }
};
