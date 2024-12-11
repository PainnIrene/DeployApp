import express from "express";
const router = express.Router();
import { hashPassword, verifyPassword } from "../../utils/password.js";
import { generateAT, generateRT } from "../../utils/jwt.js";
import authMiddleware from "../../middlewares/Seller/jwt.js";
import renewToken from "../../middlewares/Seller/renewToken.js";
import { emailMasking } from "../../utils/user.js";
import { getIdFromJwt } from "../../utils/jwt.js";
import Seller from "../../models/Seller.js";

router.get("/", (req, res) => {
  res.send("Hello from Seller Routes");
});
router.post("/auth/register", async (req, res) => {
  try {
    const { email, password, username } = req.body;
    //1.check username n email exist or not
    const [emailCheck, usernameCheck] = await Promise.all([
      Seller.findOne({ email: email.toLowerCase() }),
      Seller.findOne({ username: username.toLowerCase() }),
    ]);
    if (emailCheck) {
      res.status(201).json({
        msg: "Email was registered!",
      });
    } else if (usernameCheck) {
      res.status(201).json({
        msg: "Username Exist!",
      });
    } else {
      //2.create User in DB with hash password
      const hashPass = await hashPassword(password);
      const newSeller = new Seller({
        email: email.toLowerCase(),
        password: hashPass,
        username: username.toLowerCase(),
      });
      await newSeller.save();
      //3.return result to client
      res.status(200).send("success");
    }
  } catch (error) {
    console.log(error);
  }
});

router.post("/auth/login", async (req, res) => {
  try {
    const { email, password, username } = req.body;
    let seller;
    // 1. Check if username
    if (email) seller = await Seller.findOne({ email: email.toLowerCase() });
    else seller = await Seller.findOne({ username: username.toLowerCase() });
    console.log(seller);
    if (!seller) {
      res.status(400).send("User does not exist");
    } else {
      // 2. Validate password
      const checkPassword = await verifyPassword(password, seller.password);

      if (checkPassword === true) {
        const AT = generateAT({ seller: seller._id.toString() });
        const RT = generateRT({ seller: seller._id.toString() });
        // Set cookies
        res.cookie("SAT", AT, {
          httpOnly: false,
          secure: false,
          maxAge: 1800000, // 30 mins
          sameSite: "lax",
        });
        res.cookie("SRT", RT, {
          httpOnly: false,
          secure: false,
          maxAge: 24 * 60 * 60 * 1000,
          sameSite: "lax",
        });

        res.status(200).json({
          name: seller.shopName,
          avtUrl: seller.avtUrl,
          username: seller.username,
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

router.get("/auth/logout", (req, res) => {
  res.clearCookie("SAT");
  res.clearCookie("SRT");
  res.send("Logout Successfully").status(200);
});

router.get("/profile", authMiddleware, renewToken, async (req, res) => {
  const userId = req.userId || getIdFromJwt(req.cookies.SAT);

  Seller.findById(userId)
    .then((user) => {
      if (user) {
        res
          .json({
            name: user.shopName,
            username: user.username,
            gender: user.gender,
            dateOfBirth: user.dateOfBirth,
            avtUrl: user.avtUrl,
            email: emailMasking(user.email),
            isEmailVerify: user.isEmailVerify,
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

export default router;
