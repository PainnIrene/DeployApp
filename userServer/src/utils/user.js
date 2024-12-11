import User from "../models/User.js";
const getAvtUrlFromId = async (id) => {
  const user = await User.findOne({ _id: id }).select("avtUrl");
  const avtUrl = user ? user.avtUrl : null;
  return avtUrl;
};
const getUserFromId = async (id) => {
  const user = await User.findOne({ _id: id }).select("avtUrl name email");
  const userInfo = user ? user : null;
  return userInfo;
};

const getEmailFromId = async (id) => {
  const emailFind = await User.findOne({ _id: id }).select("email");
  const email = emailFind && emailFind.email ? emailFind.email : null;
  return email;
};

const isEmailOrPhoneOrUserName = (account) => {
  let accountType;
  const emailRegex =
    /^(?!.*[.@]{2})(?!.*[ .]@)[a-zA-Z0-9]+(?:[ .][a-zA-Z0-9]+)*@[a-zA-Z0-9]+(?:-?[a-zA-Z0-9]+)*(?:\.[a-zA-Z]{2,})+$/;
  const phoneNumberRegex = /^[+]*[(]{0,1}[0-9]{1,4}[)]{0,1}[-\s\./0-9]*$/;
  if (emailRegex.test(account)) {
    accountType = "email";
  } else if (phoneNumberRegex.test(account)) {
    accountType = "phoneNumber";
  } else {
    accountType = "username";
  }
  return accountType;
};
const emailMasking = (email) => {
  const [localPart, domainPart] = email.split("@");

  if (localPart.length <= 5) {
    return `${localPart}@${domainPart}`;
  }

  const visibleStart = localPart.slice(0, 3);
  const visibleEnd = localPart.slice(-2);
  const maskedPart = "**********";

  return `${visibleStart}${maskedPart}${visibleEnd}@${domainPart}`;
};

const phoneNumberMasking = (phoneNumber) => {
  if (phoneNumber.length <= 5) {
    return phoneNumber;
  }

  const firstTwoDigits = phoneNumber.match(/\d{2}/);
  const lastThreeDigits = phoneNumber.match(/\d{3}$/);

  if (!firstTwoDigits || !lastThreeDigits) {
    return phoneNumber;
  }

  const startIndex = phoneNumber.indexOf(firstTwoDigits[0]);
  const endIndex = phoneNumber.lastIndexOf(lastThreeDigits[0]);

  const visibleStart = phoneNumber.slice(0, startIndex + 2);
  const visibleEnd = phoneNumber.slice(endIndex);
  const maskLength = endIndex - (startIndex + 2);
  const maskedPart = "*".repeat(maskLength);

  return `${visibleStart}${maskedPart}${visibleEnd}`;
};

export {
  getAvtUrlFromId,
  getUserFromId,
  isEmailOrPhoneOrUserName,
  emailMasking,
  phoneNumberMasking,
  getEmailFromId,
};
