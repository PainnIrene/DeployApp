import { verifyAT, verifyRT } from "../../utils/verifyJWT.js";
import { redisKeyExist } from "../../utils/redis.js";
import { generateAT, generateNewRT, getIdFromJwt } from "../../utils/jwt.js";
const authMiddleware = async (req, res, next) => {
  const SAT = req.cookies.SAT || "";
  const ART = req.cookies.ART || "";

  const keyExist = await redisKeyExist(ART);
  console.log(ART);
  console.log(verifyRT(ART));
  console.log(keyExist);
  if (ART && verifyRT(ART) && !keyExist) {
    if (SAT && verifyAT(SAT)) {
      console.log("Verify thành công");
      next();
    } else {
      console.log("AT đã hết hạn");
      const { newAT, newRT, expireRT } = generateNewRT(ART);
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
