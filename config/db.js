const mongoose = require("mongoose");

const connectDB = async () => {
  try {
    await mongoose.connect("mongodb://0.0.0.0/todoList", {
      useNewUrlParser: true,
    });
    console.log("MongoDB connected...");
  } catch (error) {
    console.error(error);
  }
};

module.exports = connectDB;
