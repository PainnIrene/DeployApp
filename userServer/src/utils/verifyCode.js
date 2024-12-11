const generateRandomSixDigitCode = () => {
  const randomNumber = Math.floor(Math.random() * 1000000);
  return randomNumber.toString().padStart(6, "0");
};
const generateVerifyEmailCode = (userID, currentTime) => {
  const code = generateRandomSixDigitCode();
  return {
    key: "emailVerify:" + userID,
    code: code,
    expireTime: currentTime + 300,
  };
};
const generateChangeEmailCode = (userID, currentTime) => {
  const code = generateRandomSixDigitCode();
  return {
    key: "emailChange:" + userID,
    code: code,
    expireTime: currentTime + 300,
  };
};
export {
  generateVerifyEmailCode,
  generateChangeEmailCode,
  generateRandomSixDigitCode,
};
