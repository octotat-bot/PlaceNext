#!/bin/bash

# Navigate to the project root
cd "$(dirname "$0")/.."

echo "Stopping PlaceNext..."

PID_FILE="scripts/.pids"

if [ -f "$PID_FILE" ]; then
    # Read PIDs from the file
    PIDS=$(cat "$PID_FILE")
    
    for PID in $PIDS; do
        if kill -0 $PID 2>/dev/null; then
            echo "Killing process $PID..."
            kill $PID
        else
            echo "Process $PID is not running."
        fi
    done
    
    # Remove the PID file
    rm "$PID_FILE"
    echo "Servers stopped successfully."
else
    echo "No PID file found. The servers might not be running, or were not started using start.sh."
    echo "Attempting to find and kill node processes related to PlaceNext..."
    
    # Fallback: kill processes running on ports 5000 and 5173
    lsof -ti:5000 | xargs kill -9 2>/dev/null
    lsof -ti:5173 | xargs kill -9 2>/dev/null
    echo "Fallback cleanup complete."
fi
