const mongoose = require("mongoose");

module.exports = async (uri) => {
  mongoose.set("strictQuery", false);
  await mongoose.connect(uri, { serverSelectionTimeoutMS: 5000 });
  console.log("✅  MongoDB connected");
};
