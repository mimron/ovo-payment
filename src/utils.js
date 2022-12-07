import crypto from "crypto";

export const encrypt = (val) => {
  const hmac = crypto
    .createHmac("sha256", process.env.OVO_SECRET_KEY)
    .update(val)
    .digest()
    .toString("base64");
  return hmac;
};