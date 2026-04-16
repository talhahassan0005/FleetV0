# Realtime Chat Debug - Step by Step

## Issue: Messages not appearing in realtime (need refresh/click)

### Root Cause
Only 1 subscriber in room instead of 2. This means:
- Receiver hasn't joined the room, OR
- Receiver using different conversationId, OR
- Socket not connected when joining room

---

## Debug Steps

### Step 1: Check Both Users Connected to Socket

**Open BOTH browser consoles (Transporter + Client)**

You should see:
```
[Socket Client] ✅ Connected: <socket-id>
[Socket Client] 🔌 Connection status: { connected: true, id: '<socket-id>', transport: 'websocket' }
```

✅ If you see this on BOTH sides → Socket connection working
❌ If missing on one side → That user's socket not connected

**In terminal, you should see:**
```
[Socket] User connected: <socket-id-1>
[Socket] User linked: <user-id-1> -> <socket-id-1>
[Socket] User connected: <socket-id-2>
[Socket] User linked: <user-id-2> -> <socket-id-2>
```

---

### Step 2: Check Both Users Join Same Room

**When you select a conversation, BOTH consoles should show:**
```
[Socket Client] ✅ Joining conversation: 69cfe14a1e475d78af86b1a3_69d5581aedc8972af616b843
```

**In terminal, you should see:**
```
[Socket] ✅ User 69cfe14a1e475d78af86b1a3 joined conversation:69cfe14a1e475d78af86b1a3_69d5581aedc8972af616b843
[Socket] 📊 Total subscribers in conversation:69cfe14a1e475d78af86b1a3_69d5581aedc8972af616b843: 1

[Socket] ✅ User 69d5581aedc8972af616b843 joined conversation:69cfe14a1e475d78af86b1a3_69d5581aedc8972af616b843
[Socket] 📊 Total subscribers in conversation:69cfe14a1e475d78af86b1a3_69d5581aedc8972af616b843: 2
```

**CRITICAL CHECK:**
- ✅ Both users should join SAME conversationId (exact string match)
- ✅ Total subscribers should become 2 (not 1)
- ❌ If only 1 subscriber → Second user didn't join or joined different room

---

### Step 3: Check Message Broadcast

**Sender console:**
```
[Chat] Sending message via socket: 69cfe14a1e475d78af86b1a3_69d5581aedc8972af616b843 test message
[Socket Client] Emitting send_message: 69cfe14a1e475d78af86b1a3_69d5581aedc8972af616b843 test message
```

**Terminal:**
```
[Socket] 📨 Received send_message from 69cfe14a1e475d78af86b1a3 for 69cfe14a1e475d78af86b1a3_69d5581aedc8972af616b843
[Socket] Message content (first 50 chars): test message
[Socket] Room subscribers in conversation:69cfe14a1e475d78af86b1a3_69d5581aedc8972af616b843: 2
[Socket] ✅ Message broadcast complete for 69cfe14a1e475d78af86b1a3_69d5581aedc8972af616b843 - Subscribers: 2
```

**CRITICAL CHECK:**
- ✅ Room subscribers should be 2 (both users)
- ❌ If 1 → Receiver not in room

---

### Step 4: Check Receiver Gets Message

**Receiver console should show:**
```
[Socket Client] 👂 Setting up message listener
[Socket Client] 📨 Message received: { _id: '...', message: 'test message', ... }
```

✅ If you see this → Message received successfully
❌ If missing → Message listener not set up or message not broadcast

---

## Common Issues & Fixes

### Issue 1: Only 1 subscriber in room

**Possible causes:**
1. **Receiver socket not connected**
   - Check Step 1 - both users should show "Connected"
   - If not connected, check browser console for connection errors

2. **Receiver didn't join room**
   - Check if `joinConversation()` was called
   - Check if conversation was selected (clicked)
   - Look for "[Socket Client] ✅ Joining conversation" in receiver console

3. **Different conversationId**
   - Compare conversationId in both consoles
   - Should be EXACT same string: `userId1_userId2` (sorted)
   - If different → Bug in conversation creation

**Fix:**
- Make sure both users click on the conversation to select it
- Check if `selectedConversation` state is set properly
- Verify `conversationId` is same on both sides

---

### Issue 2: Message listener not working

**Symptoms:**
- Room has 2 subscribers ✅
- Message broadcast complete ✅
- But receiver doesn't see message ❌

**Check receiver console for:**
```
[Socket Client] 👂 Setting up message listener
```

If missing:
- `onMessageReceived()` not called
- Check if `useEffect` with `selectedConversation` dependency ran
- Check if socket is connected when setting up listener

**Fix:**
- Make sure receiver selected the conversation
- Check if `useEffect` in chat page is running
- Verify socket connection before setting up listener

---

### Issue 3: Socket disconnects/reconnects

**Symptoms:**
- User joins room
- Then socket disconnects
- Room subscriber count drops to 0

**Check console for:**
```
[Socket Client] ❌ Disconnected: <reason>
```

**Common reasons:**
- Network issues
- Server restart
- Browser tab inactive (some browsers pause WebSocket)

**Fix:**
- Implement reconnection logic
- Re-join room after reconnect
- Keep socket alive with ping/pong

---

## Quick Test Procedure

1. **Open 2 browsers side by side**
   - Left: Transporter
   - Right: Client

2. **Open console on BOTH**
   - Press F12
   - Go to Console tab

3. **Start conversation**
   - Transporter: Click conversation
   - Client: Click same conversation
   - **WAIT** for both to show "Joining conversation"

4. **Check terminal**
   - Should show "Total subscribers: 2"
   - If not, STOP and debug Step 2

5. **Send message from Transporter**
   - Type message
   - Click Send
   - Watch BOTH consoles

6. **Expected result**
   - Transporter console: "Emitting send_message"
   - Terminal: "Message broadcast complete - Subscribers: 2"
   - Client console: "Message received"
   - Client UI: Message appears immediately

---

## If Still Not Working

Share these logs:

1. **Both browser consoles** (full output from page load)
2. **Terminal logs** (socket server output)
3. **Answer these:**
   - Do both users show "Connected"?
   - Do both users show "Joining conversation"?
   - Is conversationId SAME on both sides?
   - Does terminal show "Subscribers: 2"?
   - Does receiver console show "Message received"?
