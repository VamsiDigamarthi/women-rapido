export const ensureCaptainRole = (req, res, next) => {
  const { user } = req;
  if (user.role !== "captain") {
    return res.status(403).json({
      message: "You can't access this feature because you are not a captain.",
    });
  }
  console.log("this is afeter chapain chech successfully");
  // If user role is captain, call next() to pass control to the next middleware or route handler
  next();
  // This will never get logged because next() hands off control,
  // but log it just in case there’s a problem with next().
  console.log("This log should not appear if next() works correctly");
};
