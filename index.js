const express = require('express');
const app = express();
const { DiscussServiceClient } = require("@google-ai/generativelanguage");
  
const { GoogleAuth } = require("google-auth-library");
const client = new DiscussServiceClient({
    authClient: new GoogleAuth().fromAPIKey("AIzaSyBbvBq4Ha6ZeKKjvxvnqzGKqcGXmdRQ6T8"),
  });
app.get("/",async (req,res) =>{
  const {question} = req.params;
  const headers = req.headers;
  console.log(headers['text'])
  try {
    const result = await client.generateMessage({
      model: "models/chat-bison-001",
      prompt: {
        context: "Respond to all questions using image",
        messages: [{ content: `${headers['text']}` }],
      },
    });
    if (responseContent.startsWith("[") && responseContent.endsWith("]")) {
      // Remove [ ] and get the first data
      const searchData = responseContent.substring(1, responseContent.length - 1);
      const searchDataArray = JSON.parse(searchData);
      const firstData = searchDataArray[0];
      
      // You can use the 'firstData' here for further processing or searching
      // For now, I'll just send it as a JSON response
      res.status(201).json({ response: firstData });
    } else {
      res.status(201).json({ response: responseContent });
    }
  } catch (error) {
    console.error("Error generating message:", error);
  }
});
app.listen(3000);
