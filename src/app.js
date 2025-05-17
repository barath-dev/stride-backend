const express = require("express");

const dotenv = require("dotenv");
const http = require("http");
const https = require("https");
const fs = require("fs");
const { catchAsync } = require("./utils/catchAsync");
const AppError = require("./utils/appError");
// const globalErrorHandler = require("./src/controllers/error/errorController");
const db = require("./../config/db");


const authRoutes = require("./routes/auth.route");
const testingRoutes = require("./routes/testing.route");
const socialRoutes = require("./routes/social.route");
const userRoutes = require("./routes/user.route");


dotenv.config();



const app = express();
app.use(express.json());

app.get("/test", (req, res) => {
  res.status(200).json({
    message: "Hello World",
    status: "success",  
  });
});

app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/testing", testingRoutes);
app.use("/api/v1/social", socialRoutes);
app.use("/api/v1/upload", require("./routes/upload.route"));
app.use("/api/v1/user", userRoutes);

// app.use("*",catchAsync( async (req, res,next) => {
//   throw new AppError("This is a error from appError Class",404);
// }));

// app.use();




app.listen(process.env.HTTP_PORT || 3000, () => {
  console.log(`Server running on port ${process.env.HTTP_PORT || 3000}`);
});


https.createServer(
  {
    key: fs.readFileSync("client-key.pem"),
    cert: fs.readFileSync("client-cert.pem"),
  },
  app
).listen(process.env.HTTPS_PORT || 443, () => {
  console.log(`Server running on port ${process.env.HTTPS_PORT || 443}`);
});