import express from "express";
import cors from "cors";
import bodyParser from "body-parser";
import mongoose from "mongoose";
import http from "http";
import { Server } from "socket.io";
import cluster from "cluster";
import { cpus } from "os";
const numCPUs = cpus().length;

import "dotenv/config";
import AuthRoute from "./Routes/AuthRoute.js";
import errorHandler from "./Middlewares/errorHandle.js";
import Captain from "./Routes/CaptaineRoute.js";
import UserRoute from "./Routes/UserRoute.js";
import DeveloperRoute from "./Routes/DeveloperRoute.js";
import ChartRoute from "./Routes/ChatRoute.js";
import MessageRoute from "./Routes/MessageRoute.js";
import ContactRoute from "./Routes/ContactRoute.js";

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

let requestCount = 0;

// Custom middleware to count requests
app.use((req, res, next) => {
  requestCount++;
  console.log(`Total Requests: ${requestCount}`);
  next(); // Call the next middleware
});

console.log(requestCount);

// Error Handling Middleware - should be the last middleware added
app.use(errorHandler);

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
  },
});

// if (cluster.isMaster) {
//   console.log(`Master ${process.pid} is running`);

//   for (let i = 0; i < numCPUs - 3; i++) {
//     cluster.fork();
//   }
//   cluster.on("exit", (worker, code, signal) => {
//     console.log(`Worker ${worker.process.pid} died`);
//   });
// } else {
mongoose
  .connect(`${process.env.MONGODB_URL}`)
  .then(() =>
    server.listen(process.env.PORT, () =>
      console.log(`Server listening on ${process.env.PORT} .....!`)
    )
  )
  .catch((error) => console.log(error));
// mongoose
//   .connect(`${process.env.MONGODB_URL}women_rapido`)
//   .then(() =>
//     server.listen(process.env.PORT, () =>
//       console.log(`Server listening on ${process.env.PORT} .....!`)
//     )
//   )
//   .catch((error) => console.log(error));
// }

app.get("/", (req, res) => {
  return res.status(200).json({ message: "Welcome to Womens Rapido......!" });
});

app.use("/auth", AuthRoute);

app.use("/captain", Captain);

app.use("/user", UserRoute);

app.use("/developer", DeveloperRoute);

app.use("/chat", ChartRoute);

app.use("/message", MessageRoute);

app.use("/contact", ContactRoute);

let activeUsers = [];

io.on("connection", (socket) => {
  socket.on("new-user-add", (newUserId) => {
    if (!activeUsers.some((user) => user.userId === newUserId)) {
      activeUsers.push({ userId: newUserId, socketId: socket.id });
    }
    // console.log(activeUsers);
    io.emit("get-users", activeUsers);
  });

  socket.on("disconnect", () => {
    activeUsers = activeUsers.filter((user) => user.socketId !== socket.id);
    io.emit("get-users", activeUsers);
  });

  socket.on("send-message", (data) => {
    const { receiverId } = data;
    console.log(data);
    const user = activeUsers.find((user) => user.userId === receiverId);

    if (user) {
      io.to(user.socketId).emit("recieve-message", data);
    }
  });
});
