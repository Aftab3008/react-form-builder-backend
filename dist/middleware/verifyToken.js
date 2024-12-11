import jwt from "jsonwebtoken";
const secret_key = process.env.JWT_SECRET_KEY;
if (!secret_key) {
    throw new Error("Secret key not found");
}
export const verifyToken = async (req, res, next) => {
    try {
        const token = req.cookies.token;
        if (!token) {
            res.status(401).json({
                message: "User unauthorized",
                success: false,
            });
            return;
        }
        const decode = jwt.verify(token, secret_key);
        if (!decode) {
            res.status(401).json({
                message: "Invalid token",
                success: false,
            });
            return;
        }
        req.userId = decode.userId;
        next();
    }
    catch (error) {
        console.error("Error verifying token:", error);
        res.status(500).json({
            message: "Internal server error",
            success: false,
        });
    }
};
