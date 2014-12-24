/*jslint node: true */

/* 
 * Requests the accelerometer, temperature, and sets the color randomly evry second.
 * This requires no specific sketch on the Arduino. All of this is just talking to the bean's radio. 
 */

"use strict";

var SerialPort = require('../../').SerialPort;
var firmata = require('firmata');
var Bean = require('ble-bean');

var serialPort, firm;
var pinState = 1;
var PIN_TO_TOGGLE = 13;

var intervalId;
var connectedBean;

Bean.discover(function(bean){
  connectedBean = bean;
  process.on('SIGINT', exitHandler.bind(this));

  bean.on("disconnect", function(){
    process.exit();
  });

  // bean.notifyOne(
  //   //called when theres data
  //   function(data){
  //     if(data && data.length>=2){
  //       var value = data[1]<<8 || (data[0]);
  //       console.log("one:", value);
  //     }
  //   },
  //   //called when the notify is successfully or unsuccessfully setup
  //   function(error){
  //     if(error) console.log("one setup: ", error);
  //   });

  bean.connectAndSetup(function(){

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

  });

});

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

process.stdin.resume();//so the program will not close instantly
var triedToExit = false;

//turns off led before disconnecting
var exitHandler = function exitHandler() {

  var self = this;
  if (connectedBean && !triedToExit) {
    triedToExit = true;
    console.log('Turning off led...');
    clearInterval(intervalId);
    connectedBean.setColor(new Buffer([0x0,0x0,0x0]), function(){});
    //no way to know if succesful but often behind other commands going out, so just wait 2 seconds
    console.log('Disconnecting from Device...');
    setTimeout(connectedBean.disconnect.bind(connectedBean, function(){}), 2000);
  } else {
    process.exit();
  }
};