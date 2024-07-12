import express from "express";
import cors from "cors";
import bodyParser from "body-parser";
import mongoose from "mongoose";
import http from "http";
import "dotenv/config";
import AuthRoute from "./Routes/AuthRoute.js";
import errorHandler from "./Middlewares/errorHandle.js";
import Captain from "./Routes/CaptaineRoute.js";
import UserRoute from "./Routes/UserRoute.js";
import DeveloperRoute from "./Routes/DeveloperRoute.js";

const app = express();
app.use(bodyParser.json({ limit: "30mb", extended: true }));
app.use(bodyParser.urlencoded({ limit: "30mb", extended: true }));
app.use(
  cors({
    origin: "*", // Allow requests from this origin
    optionsSuccessStatus: 200, // Some legacy browsers choke on 204
  })
);
app.use(express.json());
app.use("/uploads", express.static("uploads"));
app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET,POST,PUT,PATCH,DELETE,OPTIONS"
  );
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  next();
});

// Error Handling Middleware - should be the last middleware added
app.use(errorHandler);

const server = http.createServer(app);

mongoose
  .connect(`${process.env.MONGODB_URL}women_rapido`)
  .then(() =>
    server.listen(process.env.PORT, () =>
      console.log(`Server listening on ${process.env.PORT} .....!`)
    )
  )
  .catch((error) => console.log(error));

app.get("/", (req, res) => {
  return res.status(200).json({ message: "Welcome to Womens Rapido......!" });
});

app.use("/auth", AuthRoute);

app.use("/captain", Captain);

app.use("/user", UserRoute);

app.use("/developer", DeveloperRoute);
