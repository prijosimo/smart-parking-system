# Smart Parking Management System
Continuous Assessment (CA) for Distributed Systems - Node.js and gRPC

This project was developed as a requirement for the Continuous Assessment (CA) of the Distributed Systems module. It is a small distributed system built with Node.js and gRPC, designed to simulate a smart parking environment. It includes three microservices, a naming service for service discovery, and a simple GUI that lets the user interact with the system.

The goal of the project is to demonstrate how microservices communicate using gRPC, how streaming RPCs work, and how a client can discover and call services dynamically.

## Microservices Included

### 1. Naming Service
Acts like a mini service registry.
Each microservice registers itself, and the client uses this service to look up host/port information.

### 2. Booking Service
Handles booking requests.
Includes:
- Basic input validation
- Unary RPC for creating bookings
- Streaming RPC for uploading booking notes

### 3. Parking Sensor Service
Simulates parking occupancy updates using server‑side streaming.

### 4. Gate Control Service
Controls the parking gate using bidirectional streaming.
The client can send commands like open or close, and the server streams status updates back.

### 5. GUI Client (CLI)
The client is a simple text‑based interface that allows you to:
- Discover available services
- Create a booking
- Start the parking occupancy stream
- Open or close the gate
- Exit the program

The menu reappears after each action so the user can continue interacting with the system.

## How to Run the Project

#### Install dependencies:
npm install

#### Start each microservice in its own terminal:
node naming-server.js
node booking-server.js
node parking-server.js
node gate-server.js

#### Start the GUI client:
node gui.js