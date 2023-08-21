const express = require('express');
const app = express();
const port = 3000;
const { DiscussServiceClient } = require("@google-ai/generativelanguage");
const { GoogleAuth } = require("google-auth-library");

const client = new DiscussServiceClient({

    authClient: new GoogleAuth().fromAPIKey("AIzaSyBbvBq4Ha6ZeKKjvxvnqzGKqcGXmdRQ6T8"),

  });
app.get('/', async (req, res) => {
    const headers = req.headers;
    try {
    const result = await client.generateMessage({

      model: "models/chat-bison-001",

      prompt: {

        context: "Respond to all questions in a paragraph. ",

        messages: [{ content: `${headers['text']}` }],

      },

    });

    const responseContent = result[0].candidates[0].content;
    res.json({ response: `${responseContent}` });
    }catch (error) {
        res.json({ response: `Sometimes something gets wrong!` });
    console.error("Error generating message:", error);

  }
});

app.listen(port, () => {
  console.log(`Server is listening at http://localhost:${port}`);
});
