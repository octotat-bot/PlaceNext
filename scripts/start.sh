#!/bin/bash

# Navigate to the project root
cd "$(dirname "$0")/.."

echo "Starting PlaceNext..."

# Start backend
echo "Starting backend..."
cd backend
npm run dev > ../backend.log 2>&1 &
BACKEND_PID=$!
echo "Backend started with PID $BACKEND_PID (logs in backend.log)"
cd ..

# Start frontend
echo "Starting frontend..."
cd frontend
npm run dev > ../frontend.log 2>&1 &
FRONTEND_PID=$!
echo "Frontend started with PID $FRONTEND_PID (logs in frontend.log)"
cd ..

# Save PIDs to a file so they can be stopped later
echo "$BACKEND_PID" > scripts/.pids
echo "$FRONTEND_PID" >> scripts/.pids

echo ""
echo "PlaceNext is now running!"
echo "Backend is running on port 5000"
echo "Frontend is running on port 5173 (usually)"
echo "To stop the servers, run: ./scripts/stop.sh"
