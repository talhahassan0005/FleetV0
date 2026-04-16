# Chat System Fixes - Testing & Debugging Guide

## What Was Fixed

### 1. **Socket.io Polling 404 Errors** ✅
- **Problem**: Socket.io was falling back to HTTP polling when WebSocket failed, causing `GET /socket.io?transport=polling` 404 errors
- **Fix**: Changed socket.ts to use WebSocket only (`transports: ['websocket']`)
- **Result**: Cleaner connection without polling fallback noise

### 2. **POST /api/chat/messages 400 Error** ✅  
- **Problem**: Frontend was only sending messages via Socket.io, not saving to MongoDB
- **Fix**: Restored HTTP POST to `/api/chat/messages` in both client and transporter handleSendMessage
- **Required Fields**: 
  - `conversationId` - From selectedConversation.conversationId
  - `receiverId` - From selectedConversation.otherParticipant._id or userId
  - `message` - The message text

### 3. **Transporter Can't Receive Messages** ✅
- **Problem**: Socket connection not properly established or messages not being broadcast
- **Fix**: 
  - Enabled WebSocket-only transport
  - Added detailed logging to socket-server.js to track room subscriptions
  - HTTP POST now persists messages to database as backup

### 4. **Empty "Add New Chat" Modal for Transporter** 🔍
- **Problem**: Modal shows no loads when transporter clicks "+"
- **Possible Causes**:
  1. No quotes exist in database for this transporter
  2. Quote's transporterId doesn't match user._id format
  3. Load's clientId is missing or corrupted
- **Added Logging**: API now logs each step (quotes found, loads fetched, etc.)

### 5. **Environment Variables** ✅
- **Added**: `NEXT_PUBLIC_SOCKET_URL="http://localhost:3002"` in .env.local
- **Reference**: Socket client uses this URL to connect to the standalone socket server

---

## Step-by-Step Testing Procedure

### Step 1: Stop Old Processes
```bash
# Kill any existing node processes
# Windows PowerShell:
Get-Process node | Stop-Process -Force

# Or use Ctrl+C in each terminal
```

### Step 2: Install Dependencies (if not already done)
```bash
npm install
# This installs socket.io, socket.io-client, and concurrently
```

### Step 3: Start Development Servers

**Option A: Single Command (Recommended)**
```bash
npm run dev:socket
# This runs: concurrently "next dev" "node socket-server.js"
# - Next.js on port 3000
# - Socket.io on port 3002
```

**Option B: Separate Terminals (for easier debugging)**
```bash
# Terminal 1: Next.js Frontend
npm run dev
# Expected: "ready - started server on 0.0.0.0:3000"

# Terminal 2: Socket.io Server
node socket-server.js
# Expected: "[Socket] 🚀 Socket.io server listening on port 3002"
```

### Step 4: Test Client-to-Transporter Communication

#### A. Create Test Accounts (if needed)
- Client account: email "client@test.com" 
- Transporter account: email "transporter@test.com"
- Both need to have existing loads/quotes

#### B. Load Chat Page
1. Log in as **CLIENT** first
2. Navigate to `/client/chat`
3. Check browser console for:
   - `[Socket] Connected: <socket-id>`
   - `GET /api/chat/conversations 200` (conversations loaded)

#### C. Send First Message from Client
1. Click on a transporter in the list
2. Type a message: "Test message from client"
3. Click "Send"
4. Check browser console and server logs:
   - **Client Browser Console**:
     ```
     [Socket] Joined conversation: 69cfe14a1e475d78af86b1a3_69de900de9dde372901067ab
     [Chat] HTTP save error: (should NOT appear)
     ```
   - **Server Terminal**:
     ```
     POST /api/chat/messages 201   ← Should be 201, not 400!
     [Socket] Received send_message from <userId> for <conversationId>
     [Socket] Room subscribers: 1   ← Should be at least 1
     [Socket] ✅ Message broadcast complete
     ```

#### D. Log in as Transporter
1. Open **New Incognito Window** or different browser
2. Log in as **TRANSPORTER**
3. Navigate to `/transporter/chat`
4. Check console for socket connection
5. **Should see the conversation** with the client
6. **Should see the message** you sent from client
7. **Should receive message in real-time** (the message appears without refresh)

#### E. Send Message from Transporter Back
1. Type a response message
2. Click "Send"
3. Switch back to client window
4. **Message should appear without refresh** (real-time via Socket.io)
5. Both should see message appear immediately

---

## What Each Log Message Means

### Socket Server Logs
```
[Socket] User connected: <socket-id>
→ User connected to port 3002

[Socket] User linked: <userId> -> <socket-id>
→ User authenticated with their ID

[Socket] User joined <conversationId>
→ User entered a specific chat room

[Socket] Room subscribers: 2
→ TWO users are in this conversation room (both will receive messages)

[Socket] ✅ Message broadcast complete
→ Message was sent to all subscribers in that room
```

### API Logs
```
GET /api/chat/conversations 200
→ Fetching list of conversations ✅

GET /api/chat/messages?conversationId=xxx 200
→ Fetching messages for a conversation ✅

POST /api/chat/messages 201
→ Message saved to database ✅

POST /api/chat/messages 400
→ ❌ BAD REQUEST - Missing required field (conversationId, receiverId, or message)

GET /api/transporter/loads 200
→ Fetching available loads for transporter ✅
[TransporterLoads] Found quotes: 0
→ ❌ This transporter has NO QUOTES in database!
```

---

## Troubleshooting

### Case 1: Socket 404 Polling Still Appearing
**Symptom**: Still seeing `GET /socket.io?transport=polling 404`

**Solution**:
1. Make sure Next.js restarted after changes
2. Clear browser cache: `Ctrl+Shift+Delete`
3. Verify NEXT_PUBLIC_SOCKET_URL is in .env.local
4. Check `.next/` cache: `rm -r .next` then `npm run dev`

### Case 2: POST /api/chat/messages 400
**Symptom**: Message not saving, getting 400 error

**Debugging**:
```bash
# Check what fields are being sent:
# Browser DevTools → Network tab → Find POST /api/chat/messages
# Click → Payload tab
# Should have: conversationId, receiverId, message
```

**Common Fix**:
- Check if `receiverId` is extracting correctly
- Make sure selectedConversation has otherParticipant with _id

### Case 3: Transporter Modal is Empty
**Symptom**: When transporter clicks "+", no loads appear

**Solution A**: Check if transporter has any quotes
```bash
# Terminal: Test with MongoDB directly
node -e "
const mongoose = require('mongoose');
const transporterId = '<transporter-user-id>';

mongoose.connect('mongodb+srv://...')
  .then(async () => {
    const quotes = await mongoose.connection.db.collection('quotes')
      .find({ transporterId: new mongoose.Types.ObjectId(transporterId) })
      .toArray();
    console.log('Quotes found:', quotes.length);
    process.exit(0);
  });
"
```

**Solution B**: Check server logs
```
[TransporterLoads] Found quotes: 0
→ No quotes exist - transporter needs to quote on loads first!

[TransporterLoads] Found loads: 0  
→ Quotes exist but loads not found - check if load IDs are valid ObjectIds
```

### Case 4: Messages Work One Way But Not the Other
**Symptom**: Client can send to transporter, but transporter can't send back

**Debugging**:
1. Check if both users are in same conversation room
2. Look for this in socket logs:
   ```
   [Socket] Room subscribers: 2
   ```
   Should be 2, if it's 1 then other user didn't join

3. Verify conversation ID is consistent:
   - Client should see: `69cfe14a_69de900` (sorted IDs)
   - Transporter should see: Same ID (sorted alphabetically)

---

## Success Checklist ✅

- [ ] Socket server starts on port 3002 without errors
- [ ] No more `/socket.io 404` polling errors
- [ ] Client can send message: POST /api/chat/messages returns 201
- [ ] Message appears on transporter in real-time (without refresh)
- [ ] Transporter can send message back
- [ ] Message appears on client in real-time
- [ ] Transporter's "+" modal shows loads when clicked
- [ ] Can start new conversation from modal
- [ ] Conversation persists after page refresh

---

## Key Files Changed
1. `src/lib/socket.ts` - WebSocket-only transport
2. `src/app/client/chat/page.tsx` - Added HTTP POST backup
3. `src/app/transporter/chat/page.tsx` - Added HTTP POST backup  
4. `socket-server.js` - Added better logging
5. `.env.local` - Added NEXT_PUBLIC_SOCKET_URL
6. `src/app/api/transporter/loads/route.ts` - Added debug logging

---

## Questions?
If issues persist, check:
1. Are both servers running? (`npm run dev:socket`)
2. Are environment variables loaded? (restart after editing .env.local)
3. Do test users have quotes in database?
4. What exact error is in browser console?
