import express from 'express';
import translate from 'translate-google';
import axios from 'axios';
import fs from 'fs';
import * as path from 'path';
import Bard from 'bard-ai';
const app = express();
const port = process.env.PORT || 3000;

app.get('/', async (req, res) => {
  try{
  const headers = req.headers;
  let typeCat;
  const psid = headers['psid'];
  if(!psid){
    return res.json({ response: "PSID is missing in the headers. \n \n Please add these headers: \n \n ``` \n psid:`*********a*******` \n ```" });
  }
  let myBard = new Bard(`${psid}`);
  if (!headers['text']) {
    return res.json({ response: "Text is missing in the headers. \n \n Please add these headers: \n \n ``` \n text:`Hi` \n ```" });
  }
  
  if(!headers['c'] || !headers['r'] || !headers['cid'] || !headers['rid']){
    typeCat = "new";
  }else{
    typeCat = "old";
  }

  if(typeCat === "old"){
    let myChatContinued = myBard.createChat({
      conversationID: headers['c'],
      responseID: headers['r'],
      choiceID: headers['cid'],
      _reqID: headers['rid'],
    });

    let myChatResponse = await myChatContinued.ask(headers['text']);
    res.json({ response: myChatResponse });

  }else if(typeCat === "new"){
    let myNewChat = myBard.createChat();
    let myChatResponse = await myNewChat.ask(headers['text']);
    let exports = await myNewChat.export();
    console.log(myChatResponse)    
    res.json({ response: myChatResponse, conversationID: exports.conversationID, responseID: exports.responseID, choiceID: exports.choiceID, reqId: exports._reqID });
  }
  }catch(e){
      res.json({response:`Error: ${e}`})
    console.log(e)
  }
});
app.get('/beta/lens/', async (req, res) => {
  try{
  const headers = req.headers;
  let typeCat;
  const psid = headers['psid'];

  if (!psid) {
    return res.json({ response: "PSID is missing in the headers. \n \n Please add these headers: \n \n ``` \n psid:`*********a*******` \n ```" });
  }

  let myBard = new Bard(`${psid}`);

  if (!headers['text']) {
    return res.json({ response: "Text is missing in the headers. \n \n Please add these headers: \n \n ``` \n text:`Hi` \n ```" });
  }

  if (!headers['c'] || !headers['r'] || !headers['cid'] || !headers['rid']) {
    typeCat = "new";
  } else {
    typeCat = "old";
  }

  const urlRegex = /(https?:\/\/[^\s]+)/;
  let text = headers['text'];
  const matches = text.match(urlRegex);

  if (matches) {
    
    const url = matches[0];
    console.log(url);

    // Extract the filename from the URL
    const filename = url.substring(url.lastIndexOf('/') + 1);

    const allowedExtensions = ['.jpg', '.png', '.wbep', '.jpeg'];
    const fileExtension = path.extname(filename).toLowerCase(); // Ensure you require 'path' module
  
    if (!allowedExtensions.includes(fileExtension)) {
      return res.json({ response: "Only .jpg, .png, .wbep, .jpeg pictures are allowed" });
    }

    // Define the path to save the image
    const filePath = `/tmp/${filename}`;

    try {
      const response = await axios.get(url, { responseType: 'stream' });

      const writer = fs.createWriteStream(filePath);

      response.data.pipe(writer);

      await new Promise((resolve, reject) => {
        writer.on('finish', resolve);
        writer.on('error', reject);
      });

      console.log(`Image downloaded to ${filePath}`);

      // Remove the URL from the text
      text = text.replace(url, ''); // Replace the URL with an empty string

      if (typeCat === "old") {
        let myChatContinued = myBard.createChat({
          conversationID: headers['c'],
          responseID: headers['r'],
          choiceID: headers['cid'],
          _reqID: headers['rid'],
        });

        let myChatResponse = await myChatContinued.ask(text,{
          image: `/tmp/${filename}`,
        }); // Use the modified text
        res.json({ response: myChatResponse });

      } else if (typeCat === "new") {
        let myNewChat = myBard.createChat();
        let myChatResponse = await myNewChat.ask(text,{
          image: `./downloads/${filename}`,
        }); // Use the modified text
        let exports = await myNewChat.export();
        console.log(myChatResponse)
        res.json({ response: myChatResponse, conversationID: exports.conversationID, responseID: exports.responseID, choiceID: exports.choiceID, reqId: exports._reqID });
      }

      // Delete the image after downloading
      await fs.promises.unlink(filePath);
      console.log(`File deleted: ${filePath}`);

    } catch (error) {
      console.error(`Error downloading or deleting image: ${error}`);
      // Handle error as needed
    }

  } else {
    console.log("No URL found in the sentence.");
  }
  }catch(e){
    console.log(e)
    res.json({response:`Error: ${e}`})
  } 
  // Your remaining code for the /beta/lens/ route goes here

  // You can send a response to the client here
});
app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`)
});
