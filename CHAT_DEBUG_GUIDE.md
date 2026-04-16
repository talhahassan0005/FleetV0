# Chat Debug Guide

## Issues Fixed

### 1. QB Invoice Creation Issues
- **QB Bill `/send` endpoint removed** - QB Sandbox doesn't support this endpoint (returns 400 "Unsupported Operation")
- **QB Links fixed** - Now using correct format `/app/bill/167` instead of `?txnId=167` which caused 404 errors
- **Duplicate retry removed** - Token refresh was calling API twice

### 2. Chat Debug Logging Added
Added comprehensive logging to track message flow:
- `socket.ts` - Client-side socket logging
- `transporter/chat/page.tsx` - Transporter message send logging
- `client/chat/page.tsx` - Client message send logging  
- `socket-server.js` - Server-side message receive logging

## How to Debug Chat Issues

### Step 1: Check Socket Connection
Open browser console and look for:
```
[Socket] Initializing connection to: http://localhost:3002
[Socket] Connected: <socket-id>
```

If you see connection errors, check:
1. Socket server is running on port 3002: `npm run dev:socket`
2. No firewall blocking port 3002
3. Browser console for WebSocket errors

### Step 2: Check Message Send
When you send a message, you should see in browser console:
```
[Chat] Sending message via socket: <conversationId> <message>
[Socket Client] Emitting send_message: <conversationId> <message>
```

If you DON'T see these logs:
- Socket is not connected
- Check Step 1 first

### Step 3: Check Server Receives Message
In terminal running `npm run dev:socket`, you should see:
```
[Socket] 📨 Received send_message from <userId> for <conversationId>
[Socket] Message content (first 50 chars): <message>
[Socket] Room subscribers in conversation:<conversationId>: 2
[Socket] ✅ Message broadcast complete for <conversationId> - Subscribers: 2
```

If you DON'T see these logs:
- Message not reaching server
- Check socket connection in Step 1
- Check if `send_message` event is being emitted (Step 2)

### Step 4: Check Message Received
In browser console of BOTH users, you should see:
```
[Socket] message_received event with data
```

If receiver doesn't get message:
- Check if receiver joined the conversation room
- Look for `[Socket] Joined conversation: <conversationId>` in receiver's console
- Check if both users have same `conversationId`

## Common Issues

### Issue: "Add New" button shows no loads

**For Transporter:**
- Check `/api/transporter/loads` returns data
- Open browser Network tab → Click "Add New" → Check API response
- Should return loads where transporter has submitted quotes

**For Client:**
- Check `/api/client/loads` returns data
- Should return client's loads with transporters who quoted

### Issue: Messages not appearing in UI

**Check:**
1. Message saved to database? Check `/api/chat/messages` POST response
2. Socket broadcast working? Check server logs for "Message broadcast complete"
3. Receiver listening? Check receiver console for "message_received" event
4. Duplicate message filter? Check if message `_id` already exists in state

### Issue: Socket keeps disconnecting

**Check:**
1. Socket server running? `npm run dev:socket` should show "Socket.io server listening on port 3002"
2. Network issues? Check browser console for WebSocket errors
3. Auth token expired? Socket uses `userId` from session

## Testing Checklist

- [ ] Socket server running on port 3002
- [ ] Both users can connect to socket (check browser console)
- [ ] Transporter can see "Add New" loads
- [ ] Client can see "Add New" loads with transporters
- [ ] Transporter can send message → Client receives it
- [ ] Client can send message → Transporter receives it
- [ ] Messages persist after page refresh (saved to DB)
- [ ] Conversation list updates with last message

## Next Steps

1. **Run the app**: `npm run dev:socket`
2. **Open two browsers**: One as Client, one as Transporter
3. **Start a conversation**: Click "Add New" → Select load → Click "Chat"
4. **Send messages**: Type and send from both sides
5. **Check logs**: Browser console + Terminal logs

If messages still not working, share:
- Browser console logs (both users)
- Terminal logs (socket server)
- Network tab showing API calls
