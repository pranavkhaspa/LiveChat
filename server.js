const WebSocket = require('ws');
const port = process.env.PORT || 8080;

const wss = new WebSocket.Server({ port });

const usernames = [
  "Keyboard Warrior", "Knight Stealth", "Pixel Ninja", "Dark Coder",
  "Captain Debug", "Syntax Slayer", "Bug Buster", "Terminal Lord",
  "Code Whisperer", "Hack Samurai"
];

const avatars = [
'https://github.com/pranavkhaspa/RandomlyOurs/blob/main/1.jpg?raw=true',
'https://github.com/pranavkhaspa/RandomlyOurs/blob/main/2.jpg?raw=true',
'https://github.com/pranavkhaspa/RandomlyOurs/blob/main/3.jpg?raw=true',
'https://github.com/pranavkhaspa/RandomlyOurs/blob/main/4.jpg?raw=true',
'https://github.com/pranavkhaspa/RandomlyOurs/blob/main/5.jpg?raw=true',
 'https://github.com/pranavkhaspa/RandomlyOurs/blob/main/6.jpg?raw=true'
];

let chatEnabled = true;
let onlineUsers = new Set();

function getRandomUsername() {
  return usernames[Math.floor(Math.random() * usernames.length)];
}

function getRandomAvatar() {
  return avatars[Math.floor(Math.random() * avatars.length)];
}

wss.on('connection', (ws) => {
  const username = getRandomUsername();
  const avatar = getRandomAvatar();
  ws.username = username;
  ws.avatar = avatar;

  onlineUsers.add(ws);

  ws.send(JSON.stringify({ type: 'init', username, avatar }));

  broadcast({ type: 'online-count', count: onlineUsers.size });

  // ✅ Combined message handler
  ws.on('message', (rawMessage) => {
    const messageText = rawMessage.toString().trim();

    // Admin command handler
    if (messageText === '/disable-chat' && ws.username === 'Admin') {
      chatEnabled = false;
      broadcast({ type: 'chat-status', message: 'Chat has been disabled by Admin.' });
      return;
    }
    if (messageText === '/enable-chat' && ws.username === 'Admin') {
      chatEnabled = true;
      broadcast({ type: 'chat-status', message: 'Chat has been enabled by Admin.' });
      return;
    }

    // Regular chat message
    const msg = {
      type: 'chat',
      from: ws.username,
      avatar: ws.avatar,
      message: messageText,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    if (chatEnabled) {
      broadcast(msg);
    } else {
      ws.send(JSON.stringify({ type: 'chat-disabled' }));
    }
  });

  ws.on('close', () => {
    console.log(`${username} disconnected`);
    onlineUsers.delete(ws);
    broadcast({ type: 'online-count', count: onlineUsers.size });
  });

  console.log(`${username} connected`);
});

function broadcast(msg) {
  wss.clients.forEach(client => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(JSON.stringify(msg));
    }
  });
}

console.log(`✅ WebSocket server running at ws://localhost:${port}`);
