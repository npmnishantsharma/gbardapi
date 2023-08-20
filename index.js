const express = require('express');
const axios = require('axios');
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
    const responseContent = result[0].candidates[0].content;
    if (responseContent.startsWith("[") && responseContent.endsWith("]")) {
      
  const apiKey = 'AIzaSyAYK7xIpUm5QWueWH9Jd8cUlCwWFrUt2sc'; // Replace with your API key
  const searchUrl = `https://www.googleapis.com/customsearch/v1?key=${apiKey}&cx=d463665a7ac074f14&q=${responseContent}&searchType=image`;
    
  try {
    const response = await axios.get(searchUrl);
    const imageResults = response.data.items.map(item => item.link);
    res.status(201).json({ response: imageResults[0]});
  } catch (error) {
    console.error('Error fetching images:', error);
    res.status(500).json({ error: 'An error occurred while fetching images.' });
  }
      
      // You can use the 'firstData' here for further processing or searching
      // For now, I'll just send it as a JSON response
      
    } else {
      const replacedContent = responseContent.replace(/\[([^\]]+)\]/g, (match) => {
       const apiKey1 = 'AIzaSyAYK7xIpUm5QWueWH9Jd8cUlCwWFrUt2sc'; // Replace with your API key
       const searchUrl1 = `https://www.googleapis.com/customsearch/v1?key=${apiKey}&cx=d463665a7ac074f14&q=${match}&searchType=image`;
        let i ="";
        try {
    const response = await axios.get(searchUrl);
    const imageResults = response.data.items.map(item => item.link);
    i=imageResults[0];
  } catch (error) {
    console.error('Error fetching images:', error);
  }
        return `${i}`
    });
      res.status(201).json({ response: responseContent });
    }
  } catch (error) {
    console.error("Error generating message:", error);
  }
});
app.listen(3000);
