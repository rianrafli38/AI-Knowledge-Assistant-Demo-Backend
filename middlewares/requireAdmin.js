module.exports = function requireAdmin(req, res, next) {

  if (req.method === "OPTIONS") {
    return next();
  }
  
  const key = req.headers["x-admin-key"];

  if (!key || key !== process.env.ADMIN_UPLOAD_KEY) {
    return res.status(401).json({
      success: false,
      message: "Unauthorized"
    });
  }

  next();
};