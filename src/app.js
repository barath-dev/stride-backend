const express = require("express");
const router = require("./routes/auth.route");
const dotenv = require("dotenv");
// const { catchAsync } = require("./src/utils/catchAsync");
// const AppError = require("./src/utils/appError");
// const globalErrorHandler = require("./src/controllers/error/errorController");
const db = require("./../config/db");



dotenv.config();

const app = express();
app.use(express.json());

app.get("/", (req, res) => {
  res.status(200).json({
    message: "Hello World",
    status: "success",  
  });
});

app.use("/api/v1/auth", router);

// app.use("*",catchAsync( async (req, res,next) => {
//   throw new AppError("This is a error from appError Class",404);
//   // return res.status(404).json({
//   //   message: "Page not found",
//   //   status: "error",
//   // });
// }));

// app.use(globalErrorHandler);

app.listen(process.env.HTTP_PORT || 3000, () => {
  console.log("Server is running on port 3000");
});
