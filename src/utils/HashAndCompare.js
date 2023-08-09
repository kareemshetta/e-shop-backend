import bcrypt from "bcryptjs";

export const hash = ({ plaintext, salt = process.env.SALT_ROUND } = {}) => {
  console.log("hbvgvchvdshcbdshcbhdshcbdshbc", plaintext);
  const hashResult = bcrypt.hashSync(plaintext, parseInt(salt));
  console.log("hbvgvchvdshcbdshcbhdshcbdshbc", plaintext, hashResult);
  return hashResult;
};

export const compare = ({ plaintext, hashValue } = {}) => {
  const match = bcrypt.compareSync(plaintext, hashValue);
  return match;
};
