#!/bin/bash

# Navigate to the project root
cd "$(dirname "$0")/.."

echo "Starting PlaceNext..."

# Start backend
echo "Starting backend..."
cd backend
npm run dev &
BACKEND_PID=$!
echo "Backend started with PID $BACKEND_PID"
cd ..

# Start frontend
echo "Starting frontend..."
cd frontend
npm run dev &
FRONTEND_PID=$!
echo "Frontend started with PID $FRONTEND_PID"
cd ..

# Save PIDs to a file so they can be stopped later
echo "$BACKEND_PID" > scripts/.pids
echo "$FRONTEND_PID" >> scripts/.pids

echo ""
echo "PlaceNext is now running!"
echo "Backend is running on port 5001"
echo "Frontend is running on port 5173 (usually)"
echo "To stop the servers, run: ./scripts/stop.sh"
