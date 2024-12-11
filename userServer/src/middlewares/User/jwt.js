import { verifyAT, verifyRT } from "../../utils/verifyJWT.js";
import { redisKeyExist } from "../../utils/redis.js";
import { generateAT, generateNewRT, getIdFromJwt } from "../../utils/jwt.js";
const authMiddleware = async (req, res, next) => {
  const AT = req.cookies.AT || "";
  const RT = req.cookies.RT || "";

  const keyExist = await redisKeyExist(RT);
  console.log("Verify Token", verifyRT(RT));

  if (RT && verifyRT(RT) && !keyExist) {
    if (AT && verifyAT(AT)) {
      console.log("Verify thành công");
      next();
    } else {
      console.log("AT đã hết hạn");
      const { newAT, newRT, expireRT } = generateNewRT(RT);
      req.newAT = newAT;
      req.newRT = newRT;
      req.expireRT = expireRT;
      const userId = getIdFromJwt(newAT);
      req.userId = userId;
      next();
    }
  } else {
    console.log("Unauthorized");
    res.send("Unauthorized").status(401);
  }
};
export default authMiddleware;
