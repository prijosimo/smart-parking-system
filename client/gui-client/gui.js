const readline = require("readline");
const grpc = require("@grpc/grpc-js");
const protoLoader = require("@grpc/proto-loader");

// Load protos
const namingDef = protoLoader.loadSync("../../protos/naming.proto");
const namingProto = grpc.loadPackageDefinition(namingDef).naming;

const bookingDef = protoLoader.loadSync("../../protos/booking.proto");
const bookingProto = grpc.loadPackageDefinition(bookingDef).booking;

const parkingDef = protoLoader.loadSync("../../protos/parking.proto");
const parkingProto = grpc.loadPackageDefinition(parkingDef).parking;

const gateDef = protoLoader.loadSync("../../protos/gate.proto");
const gateProto = grpc.loadPackageDefinition(gateDef).gate;

// Naming service client
const namingClient = new namingProto.NamingService(
    "localhost:50050",
    grpc.credentials.createInsecure()
);

// CLI interface
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

function menu() {
    console.log("\n=== SMART PARKING GUI ===");
    console.log("1. Discover services");
    console.log("2. Create booking");
    console.log("3. Start parking stream");
    console.log("4. Open gate");
    console.log("5. Close gate");
    console.log("0. Exit");
    rl.question("Choose an option: ", handleMenu);
}

function handleMenu(choice) {
    switch (choice) {
        case "1":
            discoverServices();
            break;
        case "2":
            createBooking();
            break;
        case "3":
            startParkingStream();
            break;
        case "4":
            sendGateCommand("open");
            break;
        case "5":
            sendGateCommand("close");
            break;
        case "0":
            console.log("Goodbye!");
            rl.close();
            return;
        default:
            console.log("Invalid option");
            menu();
    }
}

// Discovering services
function discoverServices() {
    console.log("\n--- Discovering Services ---");

    const services = [
        "BookingService",
        "ParkingSensorService",
        "GateControlService"
    ];

    services.forEach(name => {
        namingClient.LookupService({ name }, (err, res) => {
            if (err) console.log(`${name}: ERROR - ${err.message}`);
            else console.log(`${name}: ${res.host}:${res.port}`);
        });
    });
    menu();
}

// Creating booking
function createBooking() {
    rl.question("Vehicle ID: ", vehicleId => {
        rl.question("Slot ID: ", slotId => {
            namingClient.LookupService({ name: "BookingService" }, (err, res) => {
                const client = new bookingProto.BookingService(
                    `${res.host}:${res.port}`,
                    grpc.credentials.createInsecure()
                );

                const metadata = new grpc.Metadata();
                metadata.add("auth-token", "secret123");

                client.CreateBooking({ vehicleId, slotId }, metadata, (err, response) => {
                    if (err) console.log("Error:", err.message);
                    else console.log("Booking created:", response);

                    menu();
                });
            });
        });
    });
}

// Starting parking stream
function startParkingStream() {
    namingClient.LookupService({ name: "ParkingSensorService" }, (err, res) => {
        const client = new parkingProto.ParkingSensorService(
            `${res.host}:${res.port}`,
            grpc.credentials.createInsecure()
        );

        console.log("\n--- Parking Stream Started ---");

        const stream = client.StreamOccupancyUpdates({});

        stream.on("data", msg => {
            console.log("Occupancy Update:", msg);
        });

        stream.on("end", () => {
            console.log("Stream ended");
        });
    });
}

// Gate commands
function sendGateCommand(command) {
    namingClient.LookupService({ name: "GateControlService" }, (err, res) => {
        const client = new gateProto.GateControlService(
            `${res.host}:${res.port}`,
            grpc.credentials.createInsecure()
        );

        const stream = client.GateControl();

        stream.write({ event: command });

        stream.on("data", msg => {
            console.log("Gate Response:", msg.status);
        });

        stream.on("end", () => {
            console.log("Gate stream ended");
            menu();
        });
    });
}

menu();
