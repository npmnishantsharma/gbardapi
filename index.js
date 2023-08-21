const express = require('express');
const app = express();
const port = 3000;
const { DiscussServiceClient } = require("@google-ai/generativelanguage");
app.get('/', (req, res) => {
  res.json({ response: 'API is down. Please try again later' });
});

app.listen(port, () => {
  console.log(`Server is listening at http://localhost:${port}`);
});
