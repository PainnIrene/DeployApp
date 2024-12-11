import jwt from "jsonwebtoken";

const verifyAT = (token) => {
  try {
    const decodedAT = jwt.verify(token, process.env.AT_SECRET);
    if (decodedAT) return true;
  } catch (err) {
    return false;
  }
  return true;
};
const verifyRT = (token) => {
  try {
    const decodedRT = jwt.verify(token, process.env.RT_SECRET);
    if (decodedRT) return true;
  } catch (err) {
    return false;
  }
  return true;
};
export { verifyAT, verifyRT };
