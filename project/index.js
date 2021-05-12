const express = require('express');
const app = express();

require('dotenv').config();

app.use('/', express.static('build'));

app.listen(process.env.EXPRESS_PORT, {
  etag: false
}, () => {
  console.log(`Game server listening at http://localhost:${process.env.EXPRESS_PORT}`);
});