const express = require("express");
const cors = require("cors");
require("dotenv").config();
const bodyParser = require("body-parser");
const extractText = require("./routes/extractText");
const getDocument = require("./routes/getDocument");
const sendDocument = require("./routes/sendDocument");

const app = express();
const port = 3001;

app.use(bodyParser.urlencoded({ extended: true }));

//middlewares
app.use(express.json());
app.use(
  cors({  
    origin: "http://localhost:3000",
    // origin: "http://127.0.0.1:5500", // Specify allowed origin
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"], // Specify allowed methods
    allowedHeaders: ["Content-Type", "Authorization"], // Specify allowed headers
  })
);

//app.use("/api/extractText", extractText);
app.use("/api/send-document", sendDocument);
app.use("/api/get-document", getDocument);

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
