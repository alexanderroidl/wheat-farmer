const express = require("express");
const app = express();

require("dotenv").config();

app.use("/", express.static("build"));

app.listen(process.env.EXPRESS_PORT, {
  etag: false
}, () => {
  console.log(`Game server listening at ${process.env.WEB_PROTOCOL}://${process.env.HOST_ADDRESS}:${process.env.EXPRESS_PORT}`);
});