import sdm = require("../index");

let SDM = new sdm({ uid: "test", tz: "Europe/Rome" });
setTimeout(function() {

    SDM.data(function(d) {
        console.log(d);
    }, 2000);

}, 5000);




