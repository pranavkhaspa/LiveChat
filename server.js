const WebSocket = require('ws');
const wss = new WebSocket.Server({ port: 8080 });

const usernames = [
  "Keyboard Warrior", "Knight Stealth", "Pixel Ninja", "Dark Coder",
  "Captain Debug", "Syntax Slayer", "Bug Buster", "Terminal Lord",
  "Code Whisperer", "Hack Samurai"
];

function getRandomUsername() {
  return usernames[Math.floor(Math.random() * usernames.length)];
}

wss.on('connection', (ws) => {
  const username = getRandomUsername();
  ws.username = username;

  ws.send(JSON.stringify({ type: 'init', username }));

  ws.on('message', (rawMessage) => {
    const messageText = rawMessage.toString();

    const msg = {
      type: 'chat',
      from: ws.username,
      message: messageText,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    wss.clients.forEach(client => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(JSON.stringify(msg));
      }
    });
  });

  ws.on('close', () => {
    console.log(`${username} disconnected`);
  });

  console.log(`${username} connected`);
});

console.log('✅ WebSocket server running at ws://localhost:8080');
