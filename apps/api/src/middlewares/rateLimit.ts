import rateLimit from "express-rate-limit";

export const signingRateLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 30,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    status: "fail",
    message: "Too many signing requests from this IP. Please try again later.",
  },
});
