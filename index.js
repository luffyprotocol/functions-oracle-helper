const cookieSession = require("cookie-session");
const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const port = process.env.PORT || 5001;
const authRoute = require("./routes/api");
const ccipRoute = require("./routes/getstatus");
const app = express();
app.use(express.json());
app.use(
  cookieSession({
    name: "session",
    keys: ["luffy"],
    maxAge: 120 * 1000, // 2 minutes
  })
);
app.use(
  cors({
    origin: "http://localhost:3000",
    methods: "GET,PUT,POST,DELETE",
    credentials: true,
  })
);
app.use("/api", authRoute);
app.use("/ccip", ccipRoute);
app.use(bodyParser.json());
app.listen(port, () => {
  console.log(port);
  console.log(process.env.PORT);
  console.log(`App listening at http://localhost:${port}`);
});
