const express = require('express');
const axios = require('axios');
const app = express();
const { DiscussServiceClient } = require("@google-ai/generativelanguage");
const { GoogleAuth } = require("google-auth-library");

const client = new DiscussServiceClient({
  authClient: new GoogleAuth().fromAPIKey("AIzaSyBbvBq4Ha6ZeKKjvxvnqzGKqcGXmdRQ6T8"),
});

app.get("/", async (req, res) => {
  const headers = req.headers;
  console.log(headers['text']);

  try {
    const result = await client.generateMessage({
      model: "models/chat-bison-001",
      prompt: {
        context: "Respond to all questions using image",
        messages: [{ content: `${headers['text']}` }],
      },
    });

    let responseContent = result[0].candidates[0].content;
    const matches = responseContent.match(/\[([^\]]+)\]/g);

    if (matches) {
      for (const match of matches) {
        const searchQuery = match.slice(1, -1); // Removing brackets [ ]
        const apiKey = 'AIzaSyAYK7xIpUm5QWueWH9Jd8cUlCwWFrUt2sc';
        const searchUrl = `https://www.googleapis.com/customsearch/v1?key=${apiKey}&cx=d463665a7ac074f14&q=${searchQuery}&searchType=image`;

        try {
          const response = await axios.get(searchUrl);
          const imageResults = response.data.items.map(item => item.link);
          const randomImage = imageResults[Math.floor(Math.random() * imageResults.length)];
          responseContent = responseContent.replace(match, randomImage);
        } catch (error) {
          console.error('Error fetching images:', error);
        }
      }
    }

    res.status(201).json({ response: responseContent });
  } catch (error) {
    console.error("Error generating message:", error);
    res.status(500).json({ error: "An error occurred while generating the message." });
  }
});

app.listen(1000);
