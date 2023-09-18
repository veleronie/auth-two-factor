const express = require("express");
const dotenv = require("dotenv");
const mongoose = require("mongoose");
const authRoute = require("./routes/auth");
const postRoute = require("./routes/posts");
const twoFactor = require("./routes/two-factor");
const cors = require("cors");
const session = require("express-session");

const app = express();
dotenv.config();

mongoose.connect(process.env.DB_CONNECT, () => console.log("Connected to DB"));

//Middleware
//app.use(cors());
app.use(express.json());
app.use(session({ secret: "somesecret" }));

app.set("view engine", "ejs");
app.get("/app", (req, res) => {
  res.json({ message: "Hello from server!" });
  //res.send("hello");
});
app.use("/api/user", authRoute);
//app.use("/api/login", twoFactor);
app.use("/api/posts", postRoute);

app.listen(5000, () => console.log("Server is up and running!"));

// const express = require("express"); //Строка 1
// const app = express(); //Строка 2
// const port = process.env.PORT || 5000; //Строка 3

// // Сообщение о том, что сервер запущен и прослушивает указанный порт
// app.listen(port, () => console.log(`Listening on port ${port}`)); //Строка 6

// // Создание GET маршрута
// app.get("/message", (req, res) => {
//   //Строка 9
//   res.json({ message: "YOUR EXPRESS BACKEND IS CONNECTED TO REACT" }); //Строка 10
// }); //Строка 11
