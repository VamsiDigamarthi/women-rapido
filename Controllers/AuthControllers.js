import axios from "axios";
import OtpModel from "../Modals/OtpModal.js";
import UserModel from "../Modals/UserModal.js";
import jwt from "jsonwebtoken";

// sending otp from registration
export const sendOtp = async (req, res) => {
  const { mobile } = req.body;

  if (!mobile) {
    return res.status(400).json({ message: "Mobile number is required" });
  }

  try {
    const otpExist = await OtpModel.findOne({ mobile: mobile });
    const otp = Math.floor(100000 + Math.random() * 900000);
    const otpApiUrl = `https://2factor.in/API/V1/${process.env.OTP_API_KEY}/SMS/+91${mobile}/${otp}/OTP TEMPLATE`;
    try {
      // Send OTP using Axios GET request
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
  const { name, gender, mobile, role, termsAndCondition, vehicleNumber } =
    req.body;
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
  // const { name } = req.body;
  const profilePic = req.file ? req.file.path : null;
  try {
    await UserModel.findByIdAndUpdate(
      { _id: user._id },
      { $set: { profilePic: profilePic } },
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
  const { name } = req.body;
  try {
    await UserModel.findByIdAndUpdate(
      { _id: user._id },
      { $set: { name: name } },
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
