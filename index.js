import express from 'express';
import translate from 'translate-google';
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



app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`)
});
