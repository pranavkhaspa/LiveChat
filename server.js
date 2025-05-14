const WebSocket = require('ws');
const port = process.env.PORT || 8080; // Use Render's port or 8080 for local development

const wss = new WebSocket.Server({ port });

const usernames = [
  "Keyboard Warrior", "Knight Stealth", "Pixel Ninja", "Dark Coder",
  "Captain Debug", "Syntax Slayer", "Bug Buster", "Terminal Lord",
  "Code Whisperer", "Hack Samurai"
];

const avatars = [
  'https://example.com/avatar1.png',
  'https://example.com/avatar2.png',
  'https://example.com/avatar3.png',
  'https://example.com/avatar4.png'
];

let chatEnabled = true;
let onlineUsers = new Set(); // Track online users

// Generate random username from predefined list
function getRandomUsername() {
  return usernames[Math.floor(Math.random() * usernames.length)];
}

// Assign a random avatar from the list
function getRandomAvatar() {
  return avatars[Math.floor(Math.random() * avatars.length)];
}

// Handle new WebSocket connections
wss.on('connection', (ws) => {
  const username = getRandomUsername();
  const avatar = getRandomAvatar();
  ws.username = username;
  ws.avatar = avatar;

  onlineUsers.add(ws);

  // Send the initial message to the user
  ws.send(JSON.stringify({ type: 'init', username, avatar }));

  // Send the number of online users to all clients
  const onlineCountMessage = {
    type: 'online-count',
    count: onlineUsers.size
  };
  broadcast(onlineCountMessage);

  // Handle incoming chat messages
  ws.on('message', (rawMessage) => {
    const messageText = rawMessage.toString();

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

  // Handle admin messages for enabling/disabling the chat
  ws.on('message', (rawMessage) => {
    const messageText = rawMessage.toString();

    if (messageText === '/disable-chat' && ws.username === 'Admin') {
      chatEnabled = false;
      broadcast({ type: 'chat-status', message: 'Chat has been disabled by Admin.' });
    } else if (messageText === '/enable-chat' && ws.username === 'Admin') {
      chatEnabled = true;
      broadcast({ type: 'chat-status', message: 'Chat has been enabled by Admin.' });
    }
  });

  // Close the WebSocket connection
  ws.on('close', () => {
    console.log(`${username} disconnected`);
    onlineUsers.delete(ws);
    const onlineCountMessage = {
      type: 'online-count',
      count: onlineUsers.size
    };
    broadcast(onlineCountMessage);
  });

  console.log(`${username} connected`);
});

// Broadcast message to all connected clients
function broadcast(msg) {
  wss.clients.forEach(client => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(JSON.stringify(msg));
    }
  });
}

console.log(`✅ WebSocket server running at ws://localhost:${port}`);
