import jwt from "jsonwebtoken";
const generateAT = (payload) => {
  try {
    const token = jwt.sign(
      {
        exp: Math.floor(Date.now() / 1000) + 60 * 5, //5 mins
        data: payload,
        iss: "user-service",
      },
      process.env.AT_SECRET
    );
    return token;
  } catch (err) {
    return null;
  }
};
const generateRT = (payload) => {
  try {
    const token = jwt.sign(
      {
        exp: Math.floor(Date.now() / 1000) + 60 * 15, // 15 mins
        data: payload,
        iss: "user-service",
      },
      process.env.RT_SECRET
    );
    return token;
  } catch (err) {
    return null;
  }
};
const generateNewRT = (oldToken) => {
  const decoded = jwt.verify(oldToken, process.env.RT_SECRET);
  try {
    console.log(decoded.exp);
    const newRT = jwt.sign(
      {
        exp: decoded.exp,
        data: decoded.data,
        iss: "user-service",
      },
      process.env.RT_SECRET
    );
    const newAT = generateAT(decoded.data);
    if (newAT && newRT) {
      return {
        newAT,
        newRT,
        expireRT: decoded.exp,
      };
    } else return null;
  } catch (err) {
    console.log(err);
    return null;
  }
};
const getIdFromJwt = (token) => {
  const decoded = jwt.verify(token, process.env.AT_SECRET);
  if (decoded.data.user) return decoded.data.user;
  else if (decoded.data.seller) return decoded.data.seller;
  else return null;
};
const getIdFromRT = (RT) => {
  const decoded = jwt.verify(token, process.env.RT_SECRET);
  if (decoded.data.user) return decoded.data.user;
  else return null;
};

export { generateAT, generateRT, generateNewRT, getIdFromJwt, getIdFromRT };
