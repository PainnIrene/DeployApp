import express from "express";
const router = express.Router();
import { hashPassword, verifyPassword } from "../../utils/password.js";
import { generateAT, generateRT } from "../../utils/jwt.js";
import { isEmailOrPhoneOrUserName } from "../../utils/user.js";
import {
  emailMasking,
  phoneNumberMasking,
  getEmailFromId,
} from "../../utils/user.js";
import { normalizedPhoneNumbers } from "../../utils/phone.js";
import { generateRandomSixDigitCode } from "../../utils/verifyCode.js";
import {
  getRedisValueByKey,
  setRedisKeyValue,
  deleteRedisKey,
} from "../../utils/redis.js";
import { sendEmailVerifyCode } from "../../services/mail.js";
import { sendSmsOTPCode } from "../../services/sms.js";

import User from "../../models/User.js";

router.get("/", (req, res) => {
  res.send("Hello from auth Routes");
});
router.get("/sendOTP", async (req, res) => {
  await sendSmsOTPCode({
    phone: "+84343352928",
    code: "1234567",
    action: "send_otp",
  });
  res.send("OK").status(200);
});
router.post("/register", async (req, res) => {
  try {
    const { email, password, username, phoneNumbers } = req.body;
    //1.check username n email exist or not
    const [emailCheck, usernameCheck, phoneCheck] = await Promise.all([
      User.findOne({ email: email.toLowerCase() }),
      User.findOne({ username: username.toLowerCase() }),
      User.findOne({ phoneNumbers: phoneNumbers }),
    ]);
    if (emailCheck) {
      res.status(201).json({
        msg: "Email was registered!",
      });
    } else if (usernameCheck) {
      res.status(201).json({
        msg: "Username Exist!",
      });
    } else if (phoneCheck) {
      res.status(201).json({
        msg: "Phone Number Exist!",
      });
    } else {
      //2.create User in DB with hash password
      const hashPass = await hashPassword(password);
      const newUser = new User({
        email: email.toLowerCase(),
        password: hashPass,
        username: username.toLowerCase(),
        phoneNumbers: phoneNumbers,
      });
      await newUser.save();
      //3.return result to client
      res.status(200).send("success");
    }
  } catch (error) {
    console.log(error);
  }
});

router.post("/login", async (req, res) => {
  try {
    const { email, password, username, phoneNumbers } = req.body;
    let user;
    // 1. Check if username
    if (email) user = await User.findOne({ email: email.toLowerCase() });
    else if (phoneNumbers) {
      user = await User.findOne({
        phoneNumbers: normalizedPhoneNumbers(phoneNumbers),
      });
    } else user = await User.findOne({ username: username.toLowerCase() });
    console.log(user?.username);
    if (!user) {
      res.status(400).send("User does not exist");
    } else {
      // 2. Validate password
      const checkPassword = await verifyPassword(password, user.password);

      if (checkPassword === true) {
        const AT = generateAT({ user: user._id.toString() });
        const RT = generateRT({ user: user._id.toString() });
        // Set cookies
        res.cookie("AT", AT, {
          httpOnly: false,
          secure: false,
          maxAge: 1800000, // 30 mins
          sameSite: "lax",
        });
        res.cookie("RT", RT, {
          httpOnly: false,
          secure: false,
          maxAge: 24 * 60 * 60 * 1000,
          sameSite: "lax",
        });

        res.status(200).json({
          name: user.name,
          avtUrl: user.avtUrl,
          username: user.username,
        });
      } else {
        res.status(500).send("Bad credentials");
      }
    }
  } catch (error) {
    console.log(error);
    res.status(500).send("Internal Server Error");
  }
});

router.get("/logout", (req, res) => {
  res.clearCookie("AT");
  res.clearCookie("RT");
  res.send("Logout Successfully").status(200);
});

router.post("/findAccount", async (req, res) => {
  try {
    const { account } = req.body;
    const accountType = isEmailOrPhoneOrUserName(account);
    const fieldMapping = {
      email: "email",
      phoneNumber: "phoneNumber",
      username: "username",
    };
    const searchField = fieldMapping[accountType];
    if (accountType) {
      const query = { [searchField]: account };
      console.log(query);
      const user = await User.findOne(query);
      if (user) {
        res.status(200).json({
          email: emailMasking(user.email),
          phoneNumber: user.phoneNumber
            ? phoneNumberMasking(user.phoneNumber)
            : "",
          userID: user._id,
        });
      } else {
        res.status(404).json({
          message: "User not found",
        });
      }
    }
  } catch (err) {
    console.log(err);
    res.status(500).json({
      message: "Internal server error",
    });
  }
});

router.post("/resetPassword", async (req, res) => {
  const { userID } = req.body;
  const key = "RP" + userID;
  const checkKeyExist = await getRedisValueByKey(key);
  if (checkKeyExist) {
    const { EX } = checkKeyExist;
    return res.status(200).json({
      message: "Please wait 5 mins to send code",
      expireTime: EX,
    });
  } else {
    return res.status(200).json({
      expireTime: 0,
    });
  }
});
router.post("/sendResetPasswordCode", async (req, res) => {
  try {
    const { userID } = req.body;
    const email = await getEmailFromId(userID);
    const key = "RP" + userID;
    const code = generateRandomSixDigitCode();
    const value = {
      eS: email,
      c: code,
    };
    //save code to redis
    const saveCodeToRedis = await setRedisKeyValue(key, value);
    if (!saveCodeToRedis) {
      return res.status(500).json({ message: "Failed to save code in Redis" });
    }
    //send email with the code
    const url = `http://localhost:3000/resetpassword?code=${code}&userID=${userID}`;
    const sendCodeToMail = await sendEmailVerifyCode({
      emailAddress: email,
      code: code,
      url: url,
      action: "reset_password",
    });
    if (!sendCodeToMail) {
      return res
        .status(500)
        .json({ message: "Failed to send verification email" });
    }
    return res.status(200).json({
      message: "Verification code sent successfully",
    });
  } catch (error) {
    console.error("Error in sendEmailChangeCode:", error);
    return res
      .status(500)
      .json({ message: "An error occurred while processing your request" });
  }
});
//RUN WHEN USER ENTER CODE NUMBER
router.post("/verifyResetPasswordCode", async (req, res) => {
  const { code, userID } = req.body;
  if (code && userID) {
    if (code) {
      const key = "RP" + userID;
      const value = await getRedisValueByKey(key);
      if (value) {
        const { c } = value;
        if (c == code) {
          const redirectURL = `http://localhost:3000/resetpassword?code=${code}&userID=${encodeURIComponent(
            userID
          )}`;
          return res
            .status(200)
            .json({ message: "Email verification successful", redirectURL });
        } else {
          return res.status(400).json({ message: "Invalid code" });
        }
      } else {
        return res
          .status(400)
          .json({ message: "Verification code expired or invalid" });
      }
    } else {
      return res.status(400).json({ message: "Code is required" });
    }
  }
  res.status(200);
});
//RUN AFTER ENTER CODE CORRECT OR ACCESS VIA URL PROVIDED IN EMAIL
router.post("/resetPasswordAccount", async (req, res) => {
  try {
    const { code, userID } = req.query;
    const { password } = req.body;
    if (code && userID && password) {
      const key = "RP" + userID;
      const value = await getRedisValueByKey(key);
      if (value) {
        const { c } = value;
        if (c == code) {
          //delete Key
          const isKeyDeleted = await deleteRedisKey(key);
          if (!isKeyDeleted) {
            return res
              .status(500)
              .json({ message: "Failed to delete verification code" });
          }
          //update User
          const passwordHashed = await hashPassword(password);
          if (!passwordHashed) {
            return res.status(500).json({ message: "Failed to hash password" });
          }
          const updateResult = await User.findByIdAndUpdate(userID, {
            password: passwordHashed,
          });
          if (!updateResult) {
            return res
              .status(500)
              .json({ message: "Failed to update password" });
          }
          return res
            .status(200)
            .json({ message: "Changing Password successful" });
        } else {
          return res.status(400).json({ message: "Invalid code" });
        }
      } else {
        return res
          .status(400)
          .json({ message: "Verification code expired or invalid" });
      }
    }
  } catch (err) {
    return res
      .status(500)
      .json({ message: "An error occurred while processing your request" });
  }
});
export default router;
