bean-serial
=============

Virtual serial device using ble-bean (Lightblue Bean node bindings)

## How To Use

```javascript
var Bean = require("ble-bean");
var SerialPort = require("bean-serial").SerialPort;

var serialPort;
var options = {
    logging: true // default to false
};

Bean.discover(function(bean) {
    serialPort = new SerialPort(bean, options);
    // now just use as "normal" serial connection
});
```
