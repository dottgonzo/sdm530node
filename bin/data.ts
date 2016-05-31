import sdm = require("../index");

let SDM = new sdm();
setTimeout(function() {

    SDM.data(function(d) {
        console.log(d)
    },2000)

}, 1000);



setTimeout(function() {

    console.log("last",SDM.last())

}, 10000);
