// Loading gRPC and proto files
const grpc = require("@grpc/grpc-js");
const protoLoader = require("@grpc/proto-loader");

const namingDef = protoLoader.loadSync("../protos/naming.proto");
const namingProto = grpc.loadPackageDefinition(namingDef).naming;

const bookingDef = protoLoader.loadSync("../protos/booking.proto");
const bookingProto = grpc.loadPackageDefinition(bookingDef).booking;

const parkingDef = protoLoader.loadSync("../protos/parking.proto");
const parkingProto = grpc.loadPackageDefinition(parkingDef).parking;

const gateDef = protoLoader.loadSync("../protos/gate.proto");
const gateProto = grpc.loadPackageDefinition(gateDef).gate;

// Connecting to naming service
const namingClient = new namingProto.NamingService(
    "localhost:50050",
    grpc.credentials.createInsecure()
);

// Function to discover services and display their details
function discoverServices() {
    namingClient.LookupService({ name: "BookingService" }, (err, res) => {
        document.getElementById("discoveryOutput").textContent +=
            "BookingService → " + JSON.stringify(res) + "\n";
    });

    namingClient.LookupService({ name: "ParkingSensorService" }, (err, res) => {
        document.getElementById("discoveryOutput").textContent +=
            "ParkingSensorService → " + JSON.stringify(res) + "\n";
    });

    namingClient.LookupService({ name: "GateControlService" }, (err, res) => {
        document.getElementById("discoveryOutput").textContent +=
            "GateControlService → " + JSON.stringify(res) + "\n";
    });
}

// Function to create a booking using the BookingService
function createBooking() {
    namingClient.LookupService({ name: "BookingService" }, (err, res) => {
        const client = new bookingProto.BookingService(
            `${res.host}:${res.port}`,
            grpc.credentials.createInsecure()
        );

        const metadata = new grpc.Metadata();
        metadata.add("auth-token", "secret123");

        client.CreateBooking(
            {
                vehicleId: document.getElementById("vehicleId").value,
                slotId: document.getElementById("slotId").value
            },
            metadata,
            (err, response) => {
                document.getElementById("bookingOutput").textContent =
                    err ? err.message : JSON.stringify(response, null, 2);
            }
        );
    });
}

// Function to start streaming parking occupancy updates from the ParkingSensorService
function startParkingStream() {
    namingClient.LookupService({ name: "ParkingSensorService" }, (err, res) => {
        const client = new parkingProto.ParkingSensorService(
            `${res.host}:${res.port}`,
            grpc.credentials.createInsecure()
        );

        const stream = client.StreamOccupancyUpdates({});

        stream.on("data", (msg) => {
            document.getElementById("parkingOutput").textContent +=
                JSON.stringify(msg) + "\n";
        });

        stream.on("end", () => {
            document.getElementById("parkingOutput").textContent +=
                "Stream ended\n";
        });
    });
}

// Functions to control the gate using the GateControlService
let gateStream = null;

function sendGateOpen() {
    startGateStreamIfNeeded();
    gateStream.write({ event: "open" });
}

function sendGateClose() {
    startGateStreamIfNeeded();
    gateStream.write({ event: "close" });
}

function startGateStreamIfNeeded() {
    if (gateStream) return;

    namingClient.LookupService({ name: "GateControlService" }, (err, res) => {
        const client = new gateProto.GateControlService(
            `${res.host}:${res.port}`,
            grpc.credentials.createInsecure()
        );

        gateStream = client.GateControl();

        gateStream.on("data", (msg) => {
            document.getElementById("gateOutput").textContent +=
                msg.status + "\n";
        });

        gateStream.on("end", () => {
            document.getElementById("gateOutput").textContent +=
                "Gate stream ended\n";
        });
    });
}
