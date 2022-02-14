const jwt = require("jsonwebtoken");

export function getToken(data) {
  return jwt.sign(
    data,
    process.env.JWT_KEY,
    {
      expiresIn: "90d",
    }
  );
}

export function verifyToken(token) {
  return jwt.verify(token, process.env.JWT_KEY);
}