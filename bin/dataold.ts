import sdm = require("../mono");

let SDM = new sdm();
setTimeout(function() {

    SDM.data(function(d) {
        console.log(d);
    }, 2000);

}, 1000);




