// Importing libraries and loading proto file
var readlineSync = require('readline-sync');
var grpc = require('@grpc/grpc-js');
var protoLoader = require('@grpc/proto-loader');
var PROTO_PATH = __dirname + '/../../protos/gate.proto';
var packageDefinition = protoLoader.loadSync(PROTO_PATH);
var gateProto = grpc.loadPackageDefinition(packageDefinition).gate;

// Creating the client intance
var client = new gateProto.GateControlService(
    "0.0.0.0:50052",
    grpc.credentials.createInsecure()
);

// Asking user what they want to do
var action = readlineSync.question(
    "What would you like to do?\n" +
    "1 - Enter\n" + // Unary RPC
    "2 - Notify exit\n" + // Unary RPC
    "3 - Gate control\n" + // Bidirectional streaming
)

action = parseInt(action);

// Option 1: Unary RPC
if (action === 1) {
    var vehicleId = readlineSync.question("Enter your vehicle ID: ");

    client.RequestEntry({ vehicleId: vehicleId }, function (error, response) {
        if (error) {
            console.log("Error:", error);
        } else {
            console.log("Allowed:", response.allowed);
            console.log("Message:", response.message);
        }
    });
}

// Option 2: Unary RPC
if (action === 2) {
    var vehicleId = readlineSync.question("Enter your vehicle ID: ");

    client.NotifyExit({ vehicleId: vehicleId }, function (error, response) {
        if (error) {
            console.log("Error:", error);
        } else {
            console.log("Success:", response.success);
            console.log("Message:", response.message);
        }
    });
}

// Option 3: Bidirectional streaming RPC
if (action === 3) {
    console.log("Starting gate control stream...");
    var stream = client.GateControl();

    // Receiving messages from server
    stream.on('data', function (status) {
        console.log("Server:", status.status);
    });

    stream.on('end', function () {
        console.log("Stream ended by server");
    });

    // Sending commands to server
    while (true) {
        var cmd = readlineSync.question("Enter command (open, close, or exit to stop): ");
        
        if (cmd === "exit") {
            stream.end();
            break;
        }

        stream.write({ action: cmd });
    }
}else{
    console.log("Invalid option");
}