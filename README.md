# Pickup App 📱

A real-time location sharing app for coordinating meetups with friends.

## Project Structure

```
pickup_app/
├── frontend/          # React Native/Expo mobile app
│   ├── app/          # App screens and navigation
│   ├── src/          # Source code
│   │   ├── components/  # Reusable UI components
│   │   ├── context/     # React contexts (Auth, Status, Session)
│   │   ├── services/    # API and Socket services
│   │   └── types/       # TypeScript type definitions
│   └── package.json
└── backend/           # Node.js Socket.IO server
    ├── index.js      # Main server file
    └── package.json
```

## Features

### Authentication 🔐

- Email/password registration and login
- Anonymous guest access
- Secure Firebase Authentication

### Real-time Location Sharing 📍

- Live location updates via Socket.IO
- Join hangouts with friends
- Status updates (On My Way, 5 Mins Left, Arrived)

### Status System 📊

- Real-time status broadcasting
- Filtering and pagination
- Email-based user lookup

## Getting Started

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- Expo CLI
- iOS Simulator or Android Emulator

### Backend Setup

```bash
# Navigate to backend directory
cd backend

# Install dependencies
npm install

# Start the server
npm run dev
```

The server will run on `http://localhost:3000` with a health check at `/health`.

### Frontend Setup

```bash
# Navigate to frontend directory
cd frontend

# Install dependencies
npm install

# Start the Expo development server
npx expo start
```

### Configuration

1. **Firebase Setup**:

   - Create a Firebase project
   - Enable Authentication and Firestore
   - Add your Firebase config to `.env`

2. **Socket Connection**:
   - Update the server IP in `frontend/src/services/SocketService.ts`
   - For local development, use your machine's IP address

## Development

### Running Both Services

Terminal 1 (Backend):

```bash
cd backend && npm run dev
```

Terminal 2 (Frontend):

```bash
cd frontend && npx expo start
```

### Testing

1. Start both backend and frontend
2. Open the app on a device/emulator
3. Create an account or sign in
4. Test the hangout features with location updates

## Technology Stack

### Frontend

- React Native / Expo
- TypeScript
- Firebase (Auth & Firestore)
- Socket.IO Client
- Expo Router

### Backend

- Node.js
- Express.js
- Socket.IO
- CORS enabled

## API Endpoints

### Socket Events

**Client → Server:**

- `joinHangout(hangoutId)` - Join a hangout room
- `locationUpdate(data)` - Send location update
- `statusUpdate(data)` - Send status update
- `leaveHangout(hangoutId)` - Leave hangout

**Server → Client:**

- `newLocationUpdate(data)` - Receive location updates
- `newStatusUpdate(data)` - Receive status updates
- `userJoinedHangout(data)` - User joined notification
- `userLeftHangout(data)` - User left notification

### HTTP Endpoints

- `GET /health` - Server health check

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is licensed under the ISC License.
