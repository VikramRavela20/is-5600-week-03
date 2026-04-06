const express = require('express');
const path = require('path');
const EventEmitter = require('events');

const app = express();
const chatEmitter = new EventEmitter();

const port = process.env.PORT || 3000;

// serve static files
app.use(express.static(__dirname + '/public'));


function chatApp(req, res) {
  res.sendFile(path.join(__dirname, '/chat.html'));
}


function respondText(req, res) {
  res.send('hi');
}

function respondJson(req, res) {
  res.json({
    text: 'hi',
    numbers: [1, 2, 3],
  });
}

/**
 * Echo endpoint
 */
function respondEcho(req, res) {
  const { input = '' } = req.query;

  res.json({
    normal: input,
    shouty: input.toUpperCase(),
    charCount: input.length,
    backwards: input.split('').reverse().join(''),
  });
}


function respondChat(req, res) {
  const { message } = req.query;

  chatEmitter.emit('message', message);
  res.end();
}


function respondSSE(req, res) {
  res.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Connection': 'keep-alive',
  });

  const onMessage = message => {
    res.write(`data: ${message}\n\n`);
  };

  chatEmitter.on('message', onMessage);

  res.on('close', () => {
    chatEmitter.off('message', onMessage);
  });
}


app.get('/', chatApp);        
app.get('/text', respondText);
app.get('/json', respondJson);
app.get('/echo', respondEcho);
app.get('/chat', respondChat);
app.get('/sse', respondSSE);


app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});