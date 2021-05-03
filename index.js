const express = require('express');
const app = express();

const PORT = 3000;

app.use('/', express.static('build'));

app.listen(PORT, () => {
  console.log(`Game server listening at http://localhost:${PORT}`);
});