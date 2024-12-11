import express from "express";
const router = express.Router();
import authMiddleware from "../../middlewares/User/jwt.js";
import renewToken from "../../middlewares/User/renewToken.js";
import { getIdFromJwt } from "../../utils/jwt.js";
import { getAvtUrlFromId, getUserFromId } from "../../utils/user.js";
import { sendSmsOTPCode } from "../../services/sms.js";
import { normalizedPhoneNumbers } from "../../utils/phone.js";
import { validDateString } from "../../utils/dateTime.js";
import {
  uploadSingleFile,
  deleteSingleFile,
} from "../../services/resources.js";
import { sendEmailVerifyCode } from "../../services/mail.js";
import { emailMasking, phoneNumberMasking } from "../../utils/user.js";
import { verifyPassword, hashPassword } from "../../utils/password.js";
import {
  generateVerifyEmailCode,
  generateChangeEmailCode,
  generateRandomSixDigitCode,
} from "../../utils/verifyCode.js";
import {
  setRedisKeyValue,
  verifyEmailVerifyCodeInRedis,
  deleteRedisKey,
  verifyEmailChangeCodeInRedis,
  getRedisValueByKey,
} from "../../utils/redis.js";
import User from "../../models/User.js";
import multer from "multer";
import Address from "../../models/Address.js";
import e from "express";

const upload = multer();
router.get("/", (req, res) => {
  res.send("Hi from user Route").status(200);
});
router.get("/check", async (req, res) => {
  const message = {
    name: "hoangtran",
    email: "hoangtran@gmail.com",
    code: "123",
  };
  const sendMessage = await sendVerifyEmailCode(message);
  if (sendMessage) {
    res.send("OK").status(200);
  } else {
    res.send("Not SEND").status(400);
  }
});
router.get("/profile", authMiddleware, renewToken, (req, res) => {
  const userId = req.userId || getIdFromJwt(req.cookies.AT);

  User.findById(userId)
    .then((user) => {
      if (user) {
        res
          .json({
            name: user.name,
            username: user.username,
            gender: user.gender,
            dateOfBirth: user.dateOfBirth,
            avtUrl: user.avtUrl,
            email: user.isEmailVerify ? emailMasking(user.email) : user.email,
            isEmailVerify: user.isEmailVerify,
            isPhoneNumberVerify: user.isPhoneNumberVerify,
            phoneNumbers: user.isPhoneNumberVerify
              ? phoneNumberMasking(user.phoneNumbers)
              : user.phoneNumbers,
          })
          .status(200);
      } else {
        res.status(404).json({ message: "User not found" });
      }
    })
    .catch((err) => {
      console.log("ERR here");
      console.error(err);
      res.status(500).json({ message: "Internal server error" });
    });
});
router.patch(
  "/profile",
  authMiddleware,
  renewToken,
  upload.single("file"),
  async (req, res) => {
    const userId = req.userId || getIdFromJwt(req.cookies.AT);
    const { name, gender, dateOfBirth } = req.body;
    let file = null;
    let fileExtension = "";

    if (req.file) {
      file = req.file.buffer;
      fileExtension = "." + req.file.originalname.split(".").pop();
    }

    if (!userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const updateFields = {};

    if (file && fileExtension) {
      const bucketName = "ipain-user";
      const bucketFolder = "user";
      const avtUrl = await uploadSingleFile(
        userId,
        bucketName,
        bucketFolder,
        file,
        fileExtension
      );
      if (avtUrl) {
        updateFields.avtUrl = "https://" + process.env.CLOUDFRONT_HOST + avtUrl;
        const avtUrlFromDB = await getAvtUrlFromId(userId);
        avtUrlFromDB ? await deleteSingleFile(bucketName, avtUrlFromDB) : null;
      }
    }

    if (name) {
      updateFields.name = name;
    }

    if (gender === "male" || gender === "female" || gender === "other") {
      updateFields.gender = gender;
    }

    if (validDateString(dateOfBirth)) {
      updateFields.dateOfBirth = dateOfBirth;
    }

    if (Object.keys(updateFields).length === 0) {
      return res.status(400).json({ error: "No valid fields to update" });
    }

    try {
      const updatedUser = await User.findByIdAndUpdate(
        userId,
        { $set: updateFields },
        { new: true }
      );

      if (updatedUser) {
        res.status(200).json({
          msg: "User profile updated successfully",
          data: {
            name: updatedUser.name,
            avtUrl: updatedUser.avtUrl,
            username: updatedUser.username,
          },
        });
      } else {
        res.status(404).json({ msg: "User not found" });
      }
    } catch (error) {
      console.error("Error updating user profile:", error);
      res.status(500).json({ error: "Internal Server Error" });
    }
  }
);
router.post("/address", authMiddleware, renewToken, async (req, res) => {
  const userId = req.userId || getIdFromJwt(req.cookies.AT);
  const requestData = req.body;
  const isAddressExist = await Address.exists({ user: userId });

  const newAddress = new Address({
    ...requestData,
    user: userId,
    default: isAddressExist ? requestData.defaultAddress : true,
  });

  try {
    await newAddress.save();
    res.status(200).json({
      msg: "add a new address successful",
    });
  } catch (error) {
    res.status(400).json({
      msg: "add a new address fail",
      err: error,
    });
  }
});
router.get("/addresses", authMiddleware, renewToken, async (req, res) => {
  const userId = req.userId || getIdFromJwt(req.cookies.AT);
  if (!userId) {
    return res.status(401).json({ error: "Unauthorized" });
  }
  try {
    const addresses = await Address.find({ user: userId })
      .sort({
        default: -1,
      })
      .exec();
    res.status(200).json(addresses);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch addresses" });
  }
});

router.patch(
  "/address/default",
  authMiddleware,
  renewToken,
  async (req, res) => {
    try {
      const userId = req.userId || getIdFromJwt(req.cookies.AT);

      if (!userId) {
        return res.status(401).json({ error: "Unauthorized" });
      }
      const { addressId } = req.body;
      const address = await Address.findOneAndUpdate(
        { _id: addressId, user: userId },
        { $set: { default: true } }
      );
      if (!address) {
        return res.status(404).json({ msg: "Address not found" });
      }
      res.status(200).json({ msg: "Default address updated successfully" });
    } catch (err) {
      res.status(500).json({ msg: "Internal server error" });
    }
  }
);
router.delete(
  "/address/:addressId",
  authMiddleware,
  renewToken,
  async (req, res) => {
    try {
      const userId = req.userId || getIdFromJwt(req.cookies.AT);

      if (!userId) {
        return res.status(401).json({ error: "Unauthorized" });
      }

      const addressId = req.params.addressId;

      // Kiểm tra address có tồn tại và thuộc user hiện tại không
      const address = await Address.findOne({ _id: addressId, user: userId });

      if (!address) {
        return res.status(404).json({ msg: "Address not found" });
      }

      // Đếm số lượng address của user
      const count = await Address.countDocuments({ user: userId });

      if (address.default && count > 1) {
        // Trường hợp 2: Nếu địa chỉ là default và có nhiều hơn 1 địa chỉ
        // Tìm một địa chỉ khác để gán làm default
        const otherAddress = await Address.findOne({
          user: userId,
          _id: { $ne: addressId },
        });

        if (otherAddress) {
          // Gán default=true cho địa chỉ khác và xóa địa chỉ hiện tại
          await Address.updateOne(
            { _id: otherAddress._id },
            { $set: { default: true } }
          );
          await Address.deleteOne({ _id: addressId });
          return res.status(200).json({ msg: "Address deleted successfully" });
        } else {
          // Không tìm thấy địa chỉ khác để gán default
          await Address.deleteOne({ _id: addressId });
          return res.status(200).json({ msg: "Address deleted successfully" });
        }
      } else {
        // Trường hợp 1, 3, 4: Xóa địa chỉ mà không cần gán default
        await Address.deleteOne({ _id: addressId });
        return res.status(200).json({ msg: "Address deleted successfully" });
      }
    } catch (err) {
      console.error("Error deleting address:", err);
      res.status(500).json({ msg: "Internal server error" });
    }
  }
);
router.patch(
  "/address/:addressId",
  authMiddleware,
  renewToken,
  async (req, res) => {
    try {
      const userId = req.userId || getIdFromJwt(req.cookies.AT);

      if (!userId) {
        return res.status(401).json({ msg: "Unauthorized" });
      }

      const addressId = req.params.addressId;
      const data = req.body;
      const existingAddress = await Address.findOne({
        _id: addressId,
        user: userId,
      });

      if (!existingAddress) {
        return res.status(404).json({ msg: "Address not found" });
      }

      const updatedAddress = await Address.findOneAndUpdate(
        { _id: addressId, user: userId },
        { $set: data },
        { new: true, runValidators: true }
      );

      if (!updatedAddress) {
        return res.status(500).json({ msg: "Failed to update address" });
      }
      return res.status(200).json({ msg: "Successful" });
    } catch (err) {
      console.error(err);
      res.status(500).json({ msg: "Internal server error" });
    }
  }
);

router.get("/verifyEmail", authMiddleware, renewToken, async (req, res) => {
  const userId = req.userId || getIdFromJwt(req.cookies.AT);
  try {
    const key = "VE" + userId;
    const value = await getRedisValueByKey(key);
    if (value) {
      const { eS, EX } = value;
      res.status(200).json({
        emailSent: eS,
        expireTime: EX,
        isEmailVerify: false,
      });
    } else {
      const user = await User.findById(userId);
      res.status(200).json({
        emailSent: user.email,
        expireTime: 0,
        isEmailVerify: user.isEmailVerify,
      });
    }
    return res.status(200);
  } catch (err) {
    console.error("Error in verifyEmail:", err);
    res.status(500).json({ message: "Internal server error" });
  }
});
router.post(
  "/sendEmailVerifyCode",
  authMiddleware,
  renewToken,
  async (req, res) => {
    const userId = req.userId || getIdFromJwt(req.cookies.AT);
    try {
      const user = await User.findById(userId);

      if (!user || !user.email) {
        return res.status(404).json({ message: "User not found" });
      }
      const key = "VE" + userId;
      const checkKeyExist = await getRedisValueByKey(key);
      if (checkKeyExist) {
        const { EX } = checkKeyExist;
        return res.status(401).json({
          message: "Please wait 5 mins to send code",
          expireTime: EX,
        });
      }
      //generate code and sent email verify
      const code = generateRandomSixDigitCode();
      const emailSent = user.email;
      const value = {
        eS: emailSent,
        c: code,
      };
      const saveCodeToRedis = await setRedisKeyValue(key, value);
      //save to redis
      if (!saveCodeToRedis) {
        return res
          .status(500)
          .json({ message: "Failed to save code in Redis" });
      }
      const url = `http://localhost:3000/verifyEmailByURL?code=${code}&userID=${encodeURIComponent(
        userId
      )}`;
      const sendCodeToMail = await sendEmailVerifyCode({
        emailAddress: emailSent,
        code: code,
        url,
        action: "verify_email",
      });
      if (!sendCodeToMail) {
        return res
          .status(500)
          .json({ message: "Failed to send verification email" });
      }
      return res
        .status(200)
        .json({ message: "Verification code sent successfully" });
    } catch (error) {
      console.error("Error in sendEmailVerifyCode:", error);
      return res
        .status(500)
        .json({ message: "An error occurred while processing your request" });
    }
  }
);
router.post(
  "/verifyEmailVerifyCode",
  authMiddleware,
  renewToken,
  async (req, res) => {
    const userId = req.userId || getIdFromJwt(req.cookies.AT);
    try {
      const user = await User.findById(userId);
      const { code } = req.body;
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      if (code) {
        const key = "VE" + userId;
        const value = await getRedisValueByKey(key);
        if (value) {
          const { c, eS } = value;
          if (c == code) {
            await User.findByIdAndUpdate(userId, {
              isEmailVerify: true,
              email: eS,
            });
            await deleteRedisKey(key);
            return res
              .status(200)
              .json({ message: "Email verification successful" });
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
    } catch (error) {
      return res
        .status(500)
        .json({ message: "An error occurred while processing your request" });
    }
  }
);

router.post("/verifyEmailVerifyCodeByURL", async (req, res) => {
  try {
    const { code, userID } = req.query;

    if (code) {
      const key = "VE" + userID;
      const value = await getRedisValueByKey(key);
      if (value) {
        const { c, eS } = value;
        if (c == code) {
          await User.findByIdAndUpdate(userID, {
            isEmailVerify: true,
            email: eS,
          });
          await deleteRedisKey(key);
          return res
            .status(200)
            .json({ message: "Email verification successful" });
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
  } catch (error) {
    return res
      .status(500)
      .json({ message: "An error occurred while processing your request" });
  }
});

router.get("/changeEmail", authMiddleware, renewToken, async (req, res) => {
  const userId = req.userId || getIdFromJwt(req.cookies.AT);

  try {
    const key = "CE" + userId;
    const value = await getRedisValueByKey(key);
    if (value) {
      const { eS, EX } = value;
      res.status(200).json({
        emailSent: emailMasking(eS),
        expireTime: EX,
      });
    } else {
      res.status(200).json({
        expireTime: 0,
      });
    }
    return res.status(200);
  } catch (err) {
    console.error("Error in verifyEmail:", err);
    res.status(500).json({ message: "Internal server error" });
  }
});
router.post(
  "/sendEmailChangeCode",
  authMiddleware,
  renewToken,
  async (req, res) => {
    const userId = req.userId || getIdFromJwt(req.cookies.AT);
    try {
      const { currentEmail, newEmail } = req.body;
      const user = await User.findById(userId);
      const newUser = await User.findOne({ email: newEmail });
      if (currentEmail !== user.email) {
        return res
          .status(400)
          .json({ message: "Current email does not match" });
      }
      if (newUser) {
        return res.status(403).json({
          message: "New email has already been used by another account",
        });
      }
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      const key = "CE" + userId;
      const checkKeyExist = await getRedisValueByKey(key);
      if (checkKeyExist) {
        const { EX } = checkKeyExist;
        return res.status(500).json({
          message: "Please wait 5 mins to send code",
          timeStampInit: EX,
        });
      }

      // Generate code and determine email to send to
      const code = generateRandomSixDigitCode();
      const emailSent = user.isEmailVerify ? user.email : newEmail;
      const value = {
        nE: newEmail,
        c: code,
        eS: emailSent,
      };

      // Save code into Redis
      const saveCodeToRedis = await setRedisKeyValue(key, value);
      if (!saveCodeToRedis) {
        return res
          .status(500)
          .json({ message: "Failed to save code in Redis" });
      }
      // Send email with the code
      const url = `http://localhost:3000/changeEmailByURL?code=${code}&userID=${encodeURIComponent(
        userId
      )}`;

      const sendCodeToMail = await sendEmailVerifyCode({
        emailAddress: emailSent,
        code: code,
        url,
        action: "change_email",
      });
      if (!sendCodeToMail) {
        return res
          .status(500)
          .json({ message: "Failed to send verification email" });
      }
      return res
        .status(200)
        .json({ message: "Verification code sent successfully" });
    } catch (error) {
      console.error("Error in sendEmailChangeCode:", error);
      return res
        .status(500)
        .json({ message: "An error occurred while processing your request" });
    }
  }
);

router.post(
  "/verifyEmailChangeCode",
  authMiddleware,
  renewToken,
  async (req, res) => {
    const userId = req.userId || getIdFromJwt(req.cookies.AT);
    try {
      const user = await User.findById(userId);
      const { code } = req.body;
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      if (code) {
        const key = "CE" + userId;
        const value = await getRedisValueByKey(key);
        if (value) {
          const { nE, c, eS } = value;
          if (c == code) {
            await User.findByIdAndUpdate(userId, {
              isEmailVerify: nE === eS,
              email: nE, // Use nE instead of newEmail
            });
            await deleteRedisKey(key);
            return res
              .status(200)
              .json({ message: "Email verification successful" });
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
    } catch (error) {
      return res
        .status(500)
        .json({ message: "An error occurred while processing your request" });
    }
  }
);

router.post("/verifyEmailChangeCodeByURL", async (req, res) => {
  try {
    const { code, userID } = req.query;
    console.log(code);
    console.log(userID);
    if (code) {
      const key = "CE" + userID;
      const value = await getRedisValueByKey(key);
      if (value) {
        const { nE, c, eS } = value;
        if (c == code) {
          await User.findByIdAndUpdate(userID, {
            isEmailVerify: nE === eS,
            email: nE, // Use nE instead of newEmail
          });
          await deleteRedisKey(key);
          return res
            .status(200)
            .json({ message: "Email verification successful" });
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
  } catch (error) {
    return res
      .status(500)
      .json({ message: "An error occurred while processing your request" });
  }
});
router.post("/changePassword", authMiddleware, renewToken, async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  const userId = req.userId || getIdFromJwt(req.cookies.AT);

  try {
    // Fetch user from database
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Check if current password is correct
    const isPasswordCorrect = await verifyPassword(
      currentPassword,
      user.password
    );

    if (!isPasswordCorrect) {
      return res.status(400).json({ message: "Current password is incorrect" });
    }

    // Check if new password is the same as the current password
    if (currentPassword === newPassword) {
      return res.status(400).json({
        message: "New password must be different from the current password",
      });
    }

    // Hash new password
    const hashedNewPassword = await hashPassword(newPassword);

    if (!hashedNewPassword) {
      return res.status(500).json({ message: "Error hashing new password" });
    }

    // Update user's password
    user.password = hashedNewPassword;
    await user.save();

    res.status(200).json({ message: "Password changed successfully" });
  } catch (error) {
    console.error("Error changing password:", error);
    res
      .status(500)
      .json({ message: "An error occurred while changing password" });
  }
});

router.get("/verifyPhone", authMiddleware, renewToken, async (req, res) => {
  const userId = req.userId || getIdFromJwt(req.cookies.AT);
  try {
    const key = "VP" + userId; //VP=verifyPhone
    const value = await getRedisValueByKey(key);
    if (value) {
      const { pS, EX } = value;
      res.status(200).json({
        phoneSent: "+" + pS,
        expireTime: EX,
        isEmailVerify: false,
      });
    } else {
      const user = await User.findById(userId);
      res.status(200).json({
        phoneSent: "+" + user.phoneNumbers,
        expireTime: 0,
        isPhoneNumberVerify: user.isPhoneNumberVerify,
      });
    }
    return res.status(200);
  } catch (err) {
    console.error("Error in verifyEmail:", err);
    res.status(500).json({ message: "Internal server error" });
  }
});
router.post(
  "/sendPhoneVerifyCode",
  authMiddleware,
  renewToken,
  async (req, res) => {
    const userId = req.userId || getIdFromJwt(req.cookies.AT);
    try {
      const user = await User.findById(userId);
      if (!user || !user.phoneNumbers) {
        return res.status(404).json({ message: "User not found" });
      }
      const key = "VP" + userId;
      const checkKeyExist = await getRedisValueByKey(key);
      if (checkKeyExist) {
        const { EX } = checkKeyExist;
        return res.status(401).json({
          message: "Please wait 5 mins to send code",
          expireTime: EX,
        });
      }
      //generate code and sent email verify
      const code = generateRandomSixDigitCode();
      const phoneSent = user.phoneNumbers;
      const value = {
        pS: phoneSent,
        c: code,
      };
      const saveCodeToRedis = await setRedisKeyValue(key, value);
      //save to redis
      if (!saveCodeToRedis) {
        return res
          .status(500)
          .json({ message: "Failed to save code in Redis" });
      }
      const sendSMSResult = await sendSmsOTPCode({
        phone: "+" + phoneSent,
        code: code,
        action: "send_otp_verify",
      });
      if (!sendSMSResult) {
        return res
          .status(500)
          .json({ message: "Failed to send OTP to sms. Please Try Again" });
      }
      return res
        .status(200)
        .json({ message: "Verification code sent successfully" });
    } catch (error) {
      console.error("Error in send phone OTP code:", error);
      return res
        .status(500)
        .json({ message: "An error occurred while processing your request" });
    }
  }
);
router.post(
  "/verifyPhoneVerifyCode",
  authMiddleware,
  renewToken,
  async (req, res) => {
    const userId = req.userId || getIdFromJwt(req.cookies.AT);
    try {
      const user = await User.findById(userId);
      const { code } = req.body;
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      if (code) {
        const key = "VP" + userId;
        const value = await getRedisValueByKey(key);
        if (value) {
          const { c, pS } = value;
          if (c == code) {
            await User.findByIdAndUpdate(userId, {
              isPhoneNumberVerify: true,
              phoneNumbers: pS,
            });
            await deleteRedisKey(key);
            return res
              .status(200)
              .json({ message: "Email verification successful" });
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
    } catch (error) {
      return res
        .status(500)
        .json({ message: "An error occurred while processing your request" });
    }
  }
);

router.get("/changePhone", authMiddleware, renewToken, async (req, res) => {
  const userId = req.userId || getIdFromJwt(req.cookies.AT);

  try {
    const key = "CP" + userId;
    const value = await getRedisValueByKey(key);
    if (value) {
      const { pS, EX } = value;
      res.status(200).json({
        phoneSent: "+" + phoneNumberMasking(pS),
        expireTime: EX,
      });
    } else {
      res.status(200).json({
        expireTime: 0,
      });
    }
    return res.status(200);
  } catch (err) {
    console.error("Error in verifyEmail:", err);
    res.status(500).json({ message: "Internal server error" });
  }
});
router.post(
  "/sendPhoneChangeCode",
  authMiddleware,
  renewToken,
  async (req, res) => {
    const userId = req.userId || getIdFromJwt(req.cookies.AT);
    try {
      const { currentPhone, newPhone } = req.body;
      const user = await User.findById(userId);
      const newUser = await User.findOne({ phoneNumbers: newPhone });
      if (currentPhone !== user.phoneNumbers) {
        return res
          .status(400)
          .json({ message: "Current email does not match" });
      }
      if (newUser) {
        return res.status(403).json({
          message: "New Phone has already been used by another account",
        });
      }
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      const key = "CP" + userId;
      const checkKeyExist = await getRedisValueByKey(key);
      if (checkKeyExist) {
        const { EX } = checkKeyExist;
        return res.status(500).json({
          message: "Please wait 5 mins to send code",
          timeStampInit: EX,
        });
      }
      // Generate code and determine email to send to
      const code = generateRandomSixDigitCode();
      const phoneSent = user.isPhoneNumberVerify ? user.phoneNumbers : newPhone;
      const value = {
        nP: newPhone,
        c: code,
        pS: phoneSent,
      };

      // Save code into Redis
      const saveCodeToRedis = await setRedisKeyValue(key, value);
      if (!saveCodeToRedis) {
        return res
          .status(500)
          .json({ message: "Failed to save code in Redis" });
      }

      // const sendCodeToMail = await sendEmailVerifyCode({
      //   emailAddress: emailSent,
      //   code: code,
      //   url,
      //   action: "change_email",
      // });
      // if (!sendCodeToMail) {
      //   return res
      //     .status(500)
      //     .json({ message: "Failed to send verification email" });
      // }
      return res
        .status(200)
        .json({ message: "Verification code sent successfully" });
    } catch (error) {
      console.error("Error in sending OTP to phone:", error);
      return res
        .status(500)
        .json({ message: "An error occurred while processing your request" });
    }
  }
);
router.post(
  "/verifyPhoneChangeCode",
  authMiddleware,
  renewToken,
  async (req, res) => {
    const userId = req.userId || getIdFromJwt(req.cookies.AT);
    try {
      const user = await User.findById(userId);
      const { code } = req.body;
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      if (code) {
        const key = "CP" + userId;
        const value = await getRedisValueByKey(key);
        if (value) {
          const { nP, c, pS } = value;
          if (c == code) {
            await User.findByIdAndUpdate(userId, {
              isPhoneNumberVerify: nP === pS,
              phoneNumbers: nP, // Use nE instead of newEmail
            });
            await deleteRedisKey(key);
            return res
              .status(200)
              .json({ message: "Phone verification successful" });
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
    } catch (error) {
      return res
        .status(500)
        .json({ message: "An error occurred while processing your request" });
    }
  }
);
export default router;
