const express = require('express');
const http = require('http');
const {Server} = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: [
            "http://localhost:3000",
            "http://localhost:8081", // Expo default port
            "http://192.168.1.3:3000", // Your computer's IP
            "http://192.168.1.3:8081", // Expo on your computer's IP
            "*" // Allow all origins in development (remove in production)
        ],
        methods: ["GET", "POST"]
    }
});

// Store active hangouts and their participants
const activeHangouts = new Map();

// Middleware to parse JSON
app.use(express.json());

// Basic health check endpoint
app.get('/health', (req, res) => {
    res.json({ 
        status: 'ok', 
        timestamp: new Date().toISOString(),
        activeConnections: io.engine.clientsCount,
        activeHangouts: activeHangouts.size
    });
});

// Get active hangouts (for debugging)
app.get('/hangouts', (req, res) => {
    const hangouts = Array.from(activeHangouts.entries()).map(([id, participants]) => ({
        hangoutId: id,
        participantCount: participants.size,
        participants: Array.from(participants)
    }));
    
    res.json({
        activeHangouts: hangouts,
        totalHangouts: activeHangouts.size
    });
});

io.on('connection', (socket) => {
    console.log(`✅ User connected: ${socket.id}`);

    socket.on('joinHangout', (hangoutId) => {
        // Leave any previous rooms
        socket.rooms.forEach(room => {
            if (room !== socket.id) {
                socket.leave(room);
            }
        });

        // Join the new hangout room
        socket.join(hangoutId);
        
        // Track the hangout
        if (!activeHangouts.has(hangoutId)) {
            activeHangouts.set(hangoutId, new Set());
        }
        activeHangouts.get(hangoutId).add(socket.id);
        
        console.log(`📍 User ${socket.id} joined hangout: ${hangoutId}`);
        console.log(`👥 Participants in ${hangoutId}:`, activeHangouts.get(hangoutId).size);
        
        // Notify others in the hangout
        socket.to(hangoutId).emit('userJoinedHangout', {
            socketId: socket.id,
            timestamp: new Date().toISOString()
        });
    });

    socket.on('hangoutCreated', (data) => {
        const { hangoutId, participantIds } = data;
        
        console.log(`📢 Hangout created: ${hangoutId} for participants:`, participantIds);
        
        // Notify all participants about the new hangout (broadcast to all connected clients)
        socket.broadcast.emit('hangoutInvitation', {
            hangoutId: hangoutId,
            timestamp: new Date().toISOString()
        });
    });

    socket.on('locationUpdate', (data) => {
        const { hangoutId, userId, location } = data;
        
        if (!hangoutId || !userId || !location) {
            console.warn('⚠️ Invalid location update data:', data);
            return;
        }

        console.log(`📍 Location update from ${userId} in hangout ${hangoutId}:`, location);
        
        // Broadcast to all other users in the hangout
        socket.to(hangoutId).emit('newLocationUpdate', {
            userId: userId,
            location: location,
            timestamp: new Date().toISOString()
        });
    });

    socket.on('statusUpdate', (data) => {
        const { hangoutId, userId, status } = data;
        
        console.log(`📊 Status update from ${userId} in hangout ${hangoutId}: ${status}`);
        
        // Broadcast status update to all users in the hangout
        socket.to(hangoutId).emit('newStatusUpdate', {
            userId: userId,
            status: status,
            timestamp: new Date().toISOString()
        });
    });

    // NEW: Real-time chat messages (pure socket, no Firestore)
    socket.on('sendMessage', (data) => {
        const { hangoutId, userId, message, username } = data;
        
        console.log(`💬 Message from ${username} in hangout ${hangoutId}: ${message}`);
        
        // Broadcast message to all OTHER users in the hangout (not sender)
        socket.to(hangoutId).emit('newMessage', {
            userId: userId,
            username: username,
            message: message,
            timestamp: new Date().toISOString(),
            messageId: Date.now() // Simple ID for this test
        });
    });

    // NEW: Test ping-pong for direct device-to-device communication
    socket.on('pingDevice', (data) => {
        const { hangoutId, fromUserId, toUserId, message } = data;
        
        console.log(`🏓 Ping from ${fromUserId} to ${toUserId}: ${message}`);
        
        // Send directly to specific user in hangout
        socket.to(hangoutId).emit('pongDevice', {
            fromUserId: fromUserId,
            toUserId: toUserId,
            originalMessage: message,
            response: "Pong! Device received your message",
            timestamp: new Date().toISOString()
        });
    });

    socket.on('leaveHangout', (hangoutId) => {
        socket.leave(hangoutId);
        
        // Remove from tracking
        if (activeHangouts.has(hangoutId)) {
            activeHangouts.get(hangoutId).delete(socket.id);
            
            // Clean up empty hangouts
            if (activeHangouts.get(hangoutId).size === 0) {
                activeHangouts.delete(hangoutId);
            }
        }
        
        console.log(`📤 User ${socket.id} left hangout: ${hangoutId}`);
        
        // Notify others
        socket.to(hangoutId).emit('userLeftHangout', {
            socketId: socket.id,
            timestamp: new Date().toISOString()
        });
    });

    socket.on('disconnect', (reason) => {
        console.log(`❌ User disconnected: ${socket.id}, reason: ${reason}`);
        
        // Remove from all hangouts
        activeHangouts.forEach((participants, hangoutId) => {
            if (participants.has(socket.id)) {
                participants.delete(socket.id);
                
                // Notify others in the hangout
                socket.to(hangoutId).emit('userLeftHangout', {
                    socketId: socket.id,
                    timestamp: new Date().toISOString()
                });
                
                // Clean up empty hangouts
                if (participants.size === 0) {
                    activeHangouts.delete(hangoutId);
                }
            }
        });
    });

    socket.on('error', (error) => {
        console.error(`🔴 Socket error for ${socket.id}:`, error);
    });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, ()=>{
    console.log(`🚀 Server is running on port ${PORT}`);
    console.log(`📍 Health check available at http://localhost:${PORT}/health`);
});