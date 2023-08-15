const express = require('express');
const app = express();
const { DiscussServiceClient } = require("@google-ai/generativelanguage");
  
const { GoogleAuth } = require("google-auth-library");
const client = new DiscussServiceClient({
    authClient: new GoogleAuth().fromAPIKey("AIzaSyBbvBq4Ha6ZeKKjvxvnqzGKqcGXmdRQ6T8"),
  });
app.get("/?q=:question",async (req,res) =>{
  const {question} = req.params;
  try {
    const result = await client.generateMessage({
      model: "models/chat-bison-001",
      prompt: {
        context: "Respond to all questions using image",
        messages: [{ content: `${question}` }],
      },
    });

    console.log(result[0]);
    res.status(201).json({ response: `${result[0].candidates[0].content}` })
  } catch (error) {
    console.error("Error generating message:", error);
  }
});
app.listen(3000);
