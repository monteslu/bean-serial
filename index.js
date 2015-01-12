'use strict';

var util = require('util');
var stream = require('stream');


function BeanSerialPort(bean, options) {

  var self = this;
  self.bean = bean;

  bean.on("serial", function(data, valid, seq, size){
    self.emit('data', data);
  });

}

util.inherits(BeanSerialPort, stream.Stream);


BeanSerialPort.prototype.open = function (callback) {
  this.emit('open');
  if (callback) {
    callback();
  }

};


BeanSerialPort.prototype.write = function (data, callback) {
  if(!callback) { callback = function(){}; }

  var self = this;
  if (!this.bean) {
    var err = new Error("Bean not connected.");
    if (callback) {
      callback(err);
    } else {
      self.emit('error', err);
    }
    return;
  }

  if (!Buffer.isBuffer(data)) {
    data = new Buffer(data);
  }

  //TODO upstream this in noble-device
  if(!callback) { callback = function(){} }

  self.bean.write(data,callback);

  console.log('writing buffer:', data);

};

BeanSerialPort.prototype.close = function (callback) {
  console.log('closing');
  if(callback){
    callback();
  }
};

BeanSerialPort.prototype.flush = function (callback) {
  console.log('flush');
  if(callback){
    callback();
  }
};

BeanSerialPort.prototype.drain = function (callback) {
  console.log('drain');
  if(callback){
    callback();
  }
};


module.exports = {
  SerialPort: BeanSerialPort
};
