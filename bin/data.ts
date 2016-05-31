import sdm = require("../index");

let SDM = new sdm();
setTimeout(function() {
    SDM.data().then(function(data) {
        console.log(data);
    }).catch(function(err) {
        console.log(err);
    });

}, 2000);
