import jwt from "jsonwebtoken";

export const verifyToken = (req, res, next) => {
  const bearer = req.headers.authorization;
  const token = req.cookies?.jwt || (bearer?.startsWith("Bearer ") ? bearer.split(" ")[1] : null);

  if (!token) return res.status(401).json({ message: "Not authorized, no token" });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = { id: decoded.userId };
    next();
  } catch (err) {
    return res.status(401).json({ message: "Not authorized, token failed" });
  }
};


