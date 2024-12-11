import bcrypt from "bcrypt";
const hashPassword = async (stringPassword) => {
  try {
    //generate salt with
    const roundSalt = 10;
    const salt = await bcrypt.genSalt(roundSalt);
    return await bcrypt.hash(stringPassword, salt);
  } catch (error) {
    console.log(error);
  }
  return null;
};

const verifyPassword = async (inputPassword, hashPassword) => {
  try {
    const matchFound = await bcrypt.compare(inputPassword, hashPassword);
    return matchFound;
  } catch (error) {
    console.log(error);
  }
  return false;
};
export { hashPassword, verifyPassword };
