# Chat Quick Test

## Before Testing

1. **Start servers:**
   ```bash
   npm run dev:socket
   ```
   
   You should see:
   ```
   [Socket] 🚀 Socket.io server listening on port 3002
   [Socket] ✅ Ready for real-time chat connections
   ```

2. **Open two browser windows:**
   - Window 1: Login as Transporter (life67905@gmail.com)
   - Window 2: Login as Client

## Test Steps

### Step 1: Check Socket Connection

**In BOTH browser consoles, you should see:**
```
[Socket] Initializing connection to: http://localhost:3002
[Socket] Connected: <some-socket-id>
```

**In terminal, you should see:**
```
[Socket] User connected: <socket-id>
[Socket] User linked: <user-id> -> <socket-id>
```

✅ If you see these logs, socket connection is working!
❌ If not, check:
- Socket server running on port 3002?
- Firewall blocking port 3002?
- Browser console showing WebSocket errors?

### Step 2: Start Conversation

**Transporter side:**
1. Go to Chat page
2. Click "+" button (Add New)
3. You should see loads where you submitted quotes
4. Click "Chat" button next to a client

**Client side:**
1. Go to Chat page
2. Click "+" button (Add New)
3. You should see your loads with transporters who quoted
4. Click "Chat" button next to a transporter

✅ If modal shows loads, API is working!
❌ If "No loads found":
- Transporter: Check if you have submitted quotes on any loads
- Client: Check if any transporters have quoted on your loads

### Step 3: Send Message (Transporter → Client)

**Transporter browser:**
1. Type a message: "Hello from transporter"
2. Click Send

**Check Transporter console:**
```
[Chat] Sending message via socket: <conversationId> Hello from transporter
[Socket Client] Emitting send_message: <conversationId> Hello from transporter
```

**Check Terminal:**
```
[Socket] 📨 Received send_message from <transporter-id> for <conversationId>
[Socket] Message content (first 50 chars): Hello from transporter
[Socket] Room subscribers in conversation:<conversationId>: 2
[Socket] ✅ Message broadcast complete for <conversationId> - Subscribers: 2
```

**Check Client browser:**
- Message should appear in chat window
- Console should show: `message_received` event

✅ If message appears on both sides, real-time chat is working!
❌ If not, check which step failed above

### Step 4: Send Message (Client → Transporter)

**Client browser:**
1. Type a message: "Hello from client"
2. Click Send

**Repeat same checks as Step 3**

### Step 5: Check Message Persistence

1. Refresh BOTH browsers
2. Go back to chat
3. Select same conversation
4. Previous messages should load from database

✅ If messages load after refresh, database save is working!
❌ If not, check terminal for POST /api/chat/messages errors

## Common Errors & Solutions

### Error: `POST /api/chat/messages 400`

**Check terminal logs for:**
```
[Messages API] Missing fields: { conversationId: true, messageContent: false, receiverId: true }
```

This means `messageContent` is empty or undefined.

**Solution:** Check if message text is being passed correctly in POST request.

### Error: Socket keeps showing 404

**You see:**
```
GET /socket.io?EIO=4&transport=polling&t=... 404
```

**Solution:** 
- Clear browser cache
- Hard refresh (Ctrl+Shift+R)
- Restart both servers
- Check if socket.io client is using websocket transport (should NOT see "polling" in URL)

### Error: Message sent but not received

**Check:**
1. Both users in same conversation room?
   - Terminal should show: `[Socket] User <id> joined <conversationId>`
2. ConversationId same for both users?
   - Should be format: `<userId1>_<userId2>` (sorted alphabetically)
3. Socket connected for both users?
   - Browser console should show: `[Socket] Connected: <id>`

## Success Criteria

- ✅ Socket connects on port 3002 (not 3000)
- ✅ No 404 errors for /socket.io
- ✅ "Add New" shows loads for both users
- ✅ Messages send in real-time (both directions)
- ✅ Messages persist after page refresh
- ✅ Conversation list updates with last message

## If Still Not Working

Share these logs:
1. **Browser console** (both Transporter and Client)
2. **Terminal logs** (full output from npm run dev:socket)
3. **Network tab** showing:
   - WebSocket connection status
   - POST /api/chat/messages request/response
   - GET /api/chat/conversations response
