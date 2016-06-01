// create an empty modbus client 
var ModbusRTU = require("modbus-serial");
var client = new ModbusRTU();

// open connection to a serial port 
client.connectRTU("/dev/ttyUSB0", {baudrate: 9600});
client.setID(1);

// read the values of 10 registers starting at address 0 
// on device number 1. and log the values to the console. 
setInterval(function() {
    client.readInputRegisters(72, 2, function(err, data) {

        var int32 = data.buffer.readUInt32BE();
        console.log(int32);
    });
}, 1000);