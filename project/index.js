const express = require('express');
const app = express();
const dotenv = require('dotenv').config();

app.use('/', express.static('build'));

app.listen(process.env.EXPRESS_PORT, () => {
  console.log(`Game server listening at http://localhost:${process.env.EXPRESS_PORT}`);
});