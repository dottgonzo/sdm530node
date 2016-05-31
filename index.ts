let ModbusRTU = require("modbus-serial");
import * as pathExists from "path-exists";
import merge = require("json-add");
import * as Promise from "bluebird";
import * as async from "async";

import lsusbdev = require("lsusbdev");


let client = new ModbusRTU();

interface Idefaults {
    baud?: number;
    dev?: string;
    address?: number;
    hub?: string;
}

let defaults = <Idefaults>{
    baud: 9600,
    dev: "/dev/ttyUSB0",
    address: 1
};


function data() {

    return new Promise(function(resolve, reject) {

        if (pathExists.sync("./conf.json")) {

            merge(defaults, require("./conf.json"));

            client.setID(defaults.address);


            if (defaults.hub) {
                lsusbdev().then(function(devis) {

                    for (let i = 0; i < devis.length; i++) {
                        if (devis[i].hub === defaults.hub) {
                            defaults.dev = devis[i].dev;
                        }
                    }
                    client.connectRTU(defaults.dev, { baudrate: defaults.baud }, start().then(function(data) {
                        resolve(data);
                    }).catch(function(err) {
                        reject(err);

                    }));
                }).catch(function() {
                    throw "NO USB FOR SDM";
                });
            }

        } else {
            client.connectRTU(defaults.dev, { baudrate: defaults.baud }, start().then(function(data) {
                resolve(data);
            }).catch(function(err) {
                reject(err);

            }));
        }

    });
}

function readReg(reg: number) {
    return new Promise(function(resolve, reject) {
        client.readInputRegisters(reg, 2).then(function(data) {
            resolve(data.buffer.readFloatBE());
        }).catch(function(err) {
            reject(err);
        });
    });

}

let regs = [
    {
        label: "volt",
        phase: 1,
        reg: 0
    },
    {
        label: "volt",
        phase: 2,
        reg: 2
    },
    {
        label: "volt",
        phase: 3,
        reg: 4
    },
    {
        label: "current",
        phase: 1,
        reg: 6
    },
    {
        label: "current",
        phase: 2,
        reg: 8
    },
    {
        label: "current",
        phase: 3,
        reg: 10
    },
    {
        label: "power",
        phase: 1,
        reg: 12
    },
    {
        label: "power",
        phase: 2,
        reg: 14
    },
    {
        label: "power",
        phase: 3,
        reg: 16
    },
    {
        label: "frequency",
        phase: 0,
        reg: 70
    },
    {
        label: "totalPower",
        phase: 0,
        reg: 52
    },
    {
        label: "allPower",
        phase: 0,
        reg: 74
    }
];

function start() {

    return new Promise(function(resolve, reject) {
        let answer = {};

        async.each(regs, function(iterator,cb) {
            readReg(iterator.reg).then(function(d) {

                answer[iterator.label + iterator.phase] = d;

                console.log(d);
                cb();
            }).catch(function(){
                cb();
            });
        }, function(err) {

            if (err) {
                reject(err);
            } else {
                resolve(answer);

            }

        });




    });
}


export = data