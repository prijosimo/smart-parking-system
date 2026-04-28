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
    "1 - Enter\n" +
    "2 - Notify exit\n" +
    "3 - Gate control\n"
);

action = parseInt(action);

// Option 1: RequestEntry (Unary RPC)
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

// Option 2: NotifyExit (Unary RPC)
else if (action === 2) {
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

// Option 3: GateControl (Bidirectional streaming RPC)
else if (action === 3) {
    console.log("Starting gate control stream...");
    var stream = client.GateControl();

    // Receiving messages from server
    stream.on('data', function (status) {
        console.log("Server:", status.status);
    });

    stream.on('end', function () {
        console.log("Stream ended by server");
    });

    // Non-blocking input using readline
    const readline = require('readline');
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
    });

    function ask() {
        rl.question("Enter command (open, close, or exit to stop): ", function(cmd) {
            if (cmd === "exit") {
                stream.end();
                rl.close();
                return;
            }

            stream.write({ event: cmd });
            ask(); // ask again
        });
    }

    ask();
}