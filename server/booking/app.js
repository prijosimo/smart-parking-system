// Importing libraries and loading proto file
var grpc = require('@grpc/grpc-js');
var protoLoader = require('@grpc/proto-loader');
var PROTO_PATH = __dirname + '/../../protos/booking.proto';
var packageDefinition = protoLoader.loadSync(PROTO_PATH);
var booking_proto = grpc.loadPackageDefinition(packageDefinition).booking;

// Unary RPC: CreateBooking
function CreateBooking(call, callback) {
    console.log("Creating booking for vehicle:", call.request.vehicleId);

    // Generate a simple random booking ID
    const bookingId = "BKG-" + Math.floor(Math.random() * 10000);

    callback(null, {
        bookingId: bookingId,
        message: "Booking created successfully for slot " + call.request.slotId
    });
}

// Connecting to Naming Service
var namingPackageDef = protoLoader.loadSync(__dirname + '/../../protos/naming.proto');
var namingProto = grpc.loadPackageDefinition(namingPackageDef).naming;

var namingClient = new namingProto.NamingService(
    "0.0.0.0:50050",
    grpc.credentials.createInsecure()
);

// Registering this service
namingClient.RegisterService({
    name: "BookingService",
    host: "0.0.0.0",
    port: 50053
}, (err, res) => {
    if (err) console.error("Registration error:", err);
    else console.log(res.message);
});

// Unary RPC: CancelBooking
function CancelBooking(call, callback) {
    console.log("Cancelling booking:", call.request.bookingId);

    callback(null, {
        success: true,
        message: "Booking " + call.request.bookingId + " cancelled successfully"
    });
}

// Client-side streaming RPC: UploadBookingNotes
function UploadBookingNotes(call, callback) {
    console.log("Receiving booking notes...");

    let fullNotes = "";

    // Receive each chunk sent by the client
    call.on('data', function (chunk) {
        console.log("Received note chunk:", chunk.content);
        fullNotes += chunk.content + " ";
    });

    // When the client finishes sending data
    call.on('end', function () {
        console.log("All notes received.");
        callback(null, {
            success: true,
            message: "Notes uploaded: " + fullNotes.trim()
        });
    });
}

// Create and start the BookingService server
var server = new grpc.Server();
server.addService(booking_proto.BookingService.service, {
    CreateBooking: CreateBooking,
    CancelBooking: CancelBooking,
    UploadBookingNotes: UploadBookingNotes
});

server.bindAsync("0.0.0.0:50053", grpc.ServerCredentials.createInsecure(), () => {
    console.log("Booking Service running on port 50053");
    server.start();
});