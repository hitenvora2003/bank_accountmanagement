const user = require("../model/user");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const sendMail = require("../utils/sendmail");
exports.register = async (req, res) => {
  try {
    let passdata = req.body;

    // Password
    const password = passdata.password;

    // Password Validation
    const passwordRegex =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*]).{8,}$/;

    if (!passwordRegex.test(password)) {
      return res.status(400).json({
        success: false,

        message:
          "Password must be at least 8 characters and include uppercase, lowercase, number, and special character",
      });
    }

    // Check Existing Email
    const existingUser = await user.findOne({
      email: passdata.email,
    });

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "Email already exists",
      });
    }

    // Hash Password
    const salt = await bcrypt.genSalt(10);

    const hashPassword = await bcrypt.hash(passdata.password, salt);

    // Generate Account Number
    const AccountNo = Math.floor(1000000000 + Math.random() * 9000000000);

    console.log(AccountNo);

    // Create User
    const data = await user.create({
      name: passdata.name,

      email: passdata.email,

      phone: passdata.phone,

      password: hashPassword,

      account_number: AccountNo,
    });

    // Send Email
    await sendMail(
      passdata.email,

      "Welcome",

      `Hello ${passdata.name},

Your account has been created successfully.

Your Account Number is : ${AccountNo}

Thank you for choosing us!`,
    );

    // Response
    res.status(200).json({
      success: true,

      message: "User created successfully",

      account_number: AccountNo,

      data: data,
    });
  } catch (error) {
    res.status(500).json({
      success: false,

      message: "Error creating user",

      error: error.message,
    });
  }
};
exports.getusers = async (req, res) => {
  try {
    const data = await user.find();
    res.status(200).json({
      success: true,
      message: "User data retrieved successfully",
      data: data,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error retrieving user data",
      error: error.message,
    });
  }
};
exports.updateProfile = async (req, res) => {
  try {
    const updateid = req.params.updateid;

    // password update thay to j validation chalavo
    if (req.body.password) {
      const password = req.body.password;
      const passwordRegex =
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*]).{8,}$/;
      if (!passwordRegex.test(password)) {
        return res.status(400).json({
          status: "fail",
          message:
            "Password must be at least 8 characters and include uppercase, lowercase, number, and special character",
        });
        // password
        //  hash karo
        const salt = await bcrypt.genSalt(10);
        req.body.password = await bcrypt.hash(password, salt);
      }

      const updatedata = await user
        .findByIdAndUpdate(updateid, req.body, {
          new: true,
          runValidators: true,
        })
        .select("-password");

      if (!updatedata) {
        return res.status(404).json({
          status: "fail",
          message: "User not found",
        });
      }

      res.status(200).json({
        success: true,
        message: "Profile updated successfully",
        data: updatedata,
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

exports.login = async (req, res) => {
  try {
    let passdata = req.body;

    const emailVerify = await user.findOne({
      $or: [
        { email: passdata.email },
        { name: passdata.name },
        { phone: passdata.phone },
      ],
    });
    console.log("emailVerify", emailVerify);

    if (!emailVerify) throw new Error("Invalid name or email or phone number");

    const passwordVerify = await bcrypt.compare(
      passdata.password,
      emailVerify.password,
    );
    console.log("passwordVerify", passwordVerify);

    if (!passwordVerify) throw new Error("Invalid password");
    

    // if (emailVerify.isBlocked) {
    //   throw new Error("Your account has been blocked");
    // }

    const token = jwt.sign({ id: emailVerify._id }, process.env.JWT_SECRET, {
      expiresIn: "1d",
    });
    console.log("jwt", process.env.JWT_SECRET);

    res.status(200).json({
      success: true,
      message: "User logged in successfully",
      data: {
        id: emailVerify._id,
        name: emailVerify.name,
        email: emailVerify.email,
        phone: emailVerify.phone,
      },

      token,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      error: err.message,
    });
  }
};
exports.forgotpassword = async (req, res) => {
  try {
    const userdata = await user.findOne({
      phone: req.body.phone,
    });

    if (!userdata) {
      throw new Error("user not found");
    }

    const otp = Math.floor(1000 + Math.random() * 9000);

    userdata.otp = otp;

    userdata.otpExpire = Date.now() + 5 * 60 * 1000;

    await userdata.save();

    await sendMail(
      userdata.email,

      "OTP Verification",

      `Your OTP is ${otp}`,
    );

    console.log("OTP :", otp);

    res.json({
      success: true,
      message: "OTP sent successfully",
    });
  } catch (error) {
    res.json({
      success: false,
      message: error.message,
    });
  }
};
exports.verifyotp = async (req, res) => {
  try {
    const userdata = await user.findOne({
      phone: req.body.phone,
    });

    if (!userdata) {
      throw new Error("user not found");
    }

    if (Date.now() > userdata.otpExpire) {
      throw new Error("OTP expired");
    }

    if (userdata.otp != req.body.otp) {
      throw new Error("Invalid OTP");
    }

    res.json({
      success: true,
      message: "OTP verified",
    });
  } catch (error) {
    res.json({
      success: false,
      message: error.message,
    });
  }
};
exports.resetpassword = async (req, res) => {
  try {
    const userdata = await user.findOne({
      phone: req.body.phone,
    });

    if (!userdata) {
      throw new Error("user not found");
    }
    // 🔥 Password length validation
    const password = req.body.password;
    const passwordRegex =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*]).{8,}$/;
    if (!passwordRegex.test(password)) {
      throw new Error(
        "Password must be at least 8 characters and include uppercase, lowercase, number, and special character",
      );
    }
    const hashpassword = await bcrypt.hash(req.body.password, 10);

    userdata.password = hashpassword;

    userdata.otp = null;
    userdata.otpExpire = null;

    await userdata.save();

    res.json({
      success: true,
      message: "Password reset successfully",
    });
  } catch (error) {
    res.json({
      success: false,
      message: error.message,
    });
  }
};
exports.deleteAccount = async (req, res) => {
  try {
    const userid = req.user.id;

    // User delete
    await user.findByIdAndDelete(userid);

    // User transactions delete
    await transaction.deleteMany({
      account_Holdername: userid,
    });

    res.status(200).json({
      success: true,

      message: "Account deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,

      error: error.message,
    });
  }
};
