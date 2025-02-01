#!/bin/sh

DB_PATH="/data/db/chat.db"

# Check if database exists
if [ ! -f "$DB_PATH" ]; then
    echo "Initializing database..."
    # Create database directory if it doesn't exist
    mkdir -p $(dirname "$DB_PATH")
    
    # Initialize database with schema
    sqlite3 "$DB_PATH" < ./src/lib/db/schema.sql
    
    echo "Database initialized successfully!"
else
    echo "Database already exists, skipping initialization..."
fi 