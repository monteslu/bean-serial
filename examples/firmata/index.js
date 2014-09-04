var SerialPort = require('../../').SerialPort;
var firmata = require('firmata');
var noble = require('noble');
var beanAPI = require('ble-bean');

var serialPort, firm;
var pinState = 1;
var PIN_TO_TOGGLE = 13;

var connectedBean;
var intervalId;

var readyBean = function(){

  //set color to the built in LED so we know we're connected
  connectedBean.setColor(new Buffer([255, 255, 0]), function(err){
    console.log('set color', err);
  });

  serialPort = new SerialPort(connectedBean);

  firm = new firmata.Board(serialPort, {skipHandshake: true, samplingInterval:60000}, function (err, ok) {
    if (err){
      console.log('could node connect to board----' , err);
    }

    console.log("board loaded", ok);
    togglePin();

  });

};


var connect = function(err){
  if (err){
    throw err;
  }
  process.on('SIGINT', exitHandler.bind({peripheral:this.peripheral}));

  this.peripheral.discoverServices([], setupService);
};

var setupService = function(err,services) {
  if (err){
    throw err;
  }
  services.forEach(function(service){
    if(service.uuid === beanAPI.UUID){
      connectedBean = new beanAPI.Bean(service);
      connectedBean.on('ready', readyBean);
    }
  });

};

var discover = function(peripheral){
  console.log("(scan)found:" + peripheral.advertisement.localName);
  noble.stopScanning();
  peripheral.connect(connect.bind({peripheral:peripheral}));
};

console.log('start scanning...');
noble.startScanning([beanAPI.UUID]);
noble.on('discover', discover);


process.stdin.resume();//so the program will not close instantly
var triedToExit = false;

//turns off led before disconnecting
var exitHandler = function exitHandler() {

  var self = this;
  if (this.peripheral && !triedToExit) {
    triedToExit = true;
    console.log('Disconnecting from Device...');
    clearInterval(intervalId);
    connectedBean.setColor(new Buffer([0x00,0x00,0x00]), function(){
      self.peripheral.disconnect( function(){
          console.log('disconnected');
          process.exit();
      });
    });
  } else {
    process.exit();
  }
};


function togglePin(){
  console.log('toggling', pinState);
  if(pinState){
    pinState = 0;
  }else{
    pinState = 1;
  }
  firm.digitalWrite(PIN_TO_TOGGLE, pinState);

  setTimeout(togglePin, 750);
}

