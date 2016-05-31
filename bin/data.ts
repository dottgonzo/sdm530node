import sdm = require("../index");

let SDM = new sdm();

SDM.data().then(function(data) {
    console.log(data);
}).catch(function(err) {
    console.log(err);

});