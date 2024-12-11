import redisClient from "../config/connectRedis.js";

// CHANGE_EMAIL_PREFIX = "CE"
//VERIFY_EMAIL_PREFIX = "VE"
//EXPIRE_TIME ="EX"
//nE = "newEmail"
//c = "code"
//eS ="emailSent"
const EXPIRE_TIME = 300; //300s=5mins

const redisKeyExist = async (key) => {
  try {
    const keyExist = await redisClient.exists(key);
    if (keyExist) return true;
    else return false;
  } catch (err) {
    console.log("ERR while checking key exist ", err);
  }
};
const setRedisKeyValue = async (key, value) => {
  try {
    const expireTime = Math.floor(Date.now() / 1000) + EXPIRE_TIME;
    const updateValue = { ...value, EX: expireTime };
    await redisClient.setEx(key, EXPIRE_TIME, JSON.stringify(updateValue));
    console.log(
      `Key "${key}" set with value "${JSON.stringify(
        updateValue
      )}" and TTL ${EXPIRE_TIME} seconds`
    );
    return true;
  } catch (err) {
    console.error("ERR while setting key-value in Redis:", err);
    return false;
  }
};
const getRedisValueByKey = async (key) => {
  try {
    const value = await redisClient.get(key);
    if (value === null) {
      return null;
    }
    try {
      return JSON.parse(value);
    } catch (e) {
      return value;
    }
  } catch (err) {
    console.error("Error while getting key-value from Redis:", err);
    return null;
  }
};

const verifyEmailVerifyCodeInRedis = async (userID, code) => {
  try {
    const key = `emailVerify:${userID}`;
    const value = await redisClient.get(key);

    if (value === code) {
      return true;
    } else {
      return false;
    }
  } catch (err) {
    return false; // Hoặc throw err nếu bạn muốn xử lý lỗi ở nơi gọi hàm này
  }
};

const verifyEmailChangeCodeInRedis = async (userID, codeInput) => {
  try {
    const key = `emailChange:${userID}`;
    const value = await redisClient.get(key);
    const parsedValue = JSON.parse(value);
    const { code, newEmail } = parsedValue;
    if (codeInput === code) {
      return newEmail;
    } else {
      return false;
    }
  } catch (err) {
    return false;
  }
};

const deleteRedisKey = async (key) => {
  try {
    const result = await redisClient.del(key);
    if (result === 1) {
      console.log(`Key "${key}" deleted successfully`);
      return true;
    } else {
      console.log(`Key "${key}" does not exist`);
      return false;
    }
  } catch (err) {
    console.error("ERR while deleting key in Redis:", err);
    return false; // Hoặc throw err nếu bạn muốn xử lý lỗi ở nơi gọi hàm này
  }
};

export {
  redisKeyExist,
  setRedisKeyValue,
  verifyEmailVerifyCodeInRedis,
  verifyEmailChangeCodeInRedis,
  deleteRedisKey,
  getRedisValueByKey,
};
