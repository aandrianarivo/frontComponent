const express = require('express');
const app = express();
const port = 3001;

const {
    createUser,
    getOrCreateConversation,
    sendMessage,
    getMessages,
  } = require('./services/chat-service');
  
//   const aliceId = createUser('alice');
//   const bobId = createUser('bob');
  
  const convId = getOrCreateConversation(1, 2);
  console.log(convId);
  
  sendMessage(convId, 1, 'Salut Bob !');
  sendMessage(convId, 2, 'Salut Alice, ça va ?');
  
  const messages = getMessages(convId);
  console.log(messages);

  app.listen(port, () => {
    console.log(`Example app listening on port ${port}`)
  })