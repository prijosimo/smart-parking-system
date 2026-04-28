// Importing libraries and loading proto
var readlineSync = require('readline-sync');
var grpc = require('@grpc/grpc-js');
var protoLoader = require('@grpc/proto-loader');
var PROTO_PATH = __dirname + '/../../protos/booking.proto';
var packageDefinition = protoLoader.loadSync(PROTO_PATH);
var bookingProto = grpc.loadPackageDefinition(packageDefinition).booking;

// Creating client instance
var client = new bookingProto.BookingService(
    "0.0.0.0:50053",
    grpc.credentials.createInsecure()
);

// Asking user what they want to do
var action = readlineSync.question(
    "What would you like to do?\n" +
    "1 - Create booking\n" +
    "2 - Cancel booking\n" +
    "3 - Upload booking notes\n"
);

action = parseInt(action);

// Option 1: CreateBooking (Unary RPC)
if (action === 1) {
    var vehicleId = readlineSync.question("Vehicle ID: ");
    var slotId = readlineSync.question("Slot ID: ");

    client.CreateBooking({ vehicleId, slotId }, function (err, res) {
        if (err) {
            console.error("Error:", err);
        } else {
            console.log("Booking ID:", res.bookingId);
            console.log("Message:", res.message);
        }
    });
}

// Option 2: CancelBooking (Unary RPC)
if (action === 2) {
    var bookingId = readlineSync.question("Booking ID to cancel: ");

    client.CancelBooking({ bookingId }, function (err, res) {
        if (err) {
            console.error("Error:", err);
        } else {
            console.log("Success:", res.success);
            console.log("Message:", res.message);
        }
    });
}

// Option 3: UploadBookingNotes 
if (action === 3) {
    var call = client.UploadBookingNotes(function (err, res) {
        if (err) {
            console.log("Error:", err);
        } else {
            console.log("Upload status:", res.success);
            console.log("Message:", res.message);
        }
    });

    console.log("Type your notes. Type 'done' to finish.");

    while (true) {
        var note = readlineSync.question("> ");

        if (note.toLowerCase() === "done") {
            call.end();
            break;
        }

        call.write({ content: note });
    }
}

