let ModbusRTU = require("modbus-serial");
import * as pathExists from "path-exists";
import merge = require("json-add");
import * as Promise from "bluebird";

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

if (pathExists.sync("./conf.json")) {

    merge(defaults, require("./conf.json"));

    if (defaults.hub) {
        lsusbdev().then(function(devis) {

            for (let i = 0; i < devis.length; i++) {
                if (devis[i].hub === defaults.hub) {
                    defaults.dev = devis[i].dev;
                }
            }
            start();
        }).catch(function() {
            throw "NO USB FOR SDM";
        });
    }

} else {
    start();
}


function readReg(client: any, reg: number) {
    return new Promise(function(resolve, reject) {
        client.readInputRegisters(reg, 2).then(function(data) {
            resolve(data.buffer.readFloatBE());
        }).catch(function(err) {
            reject(err);
        });
    });

}


function start() {
    client.connectRTU(defaults.dev, { baudrate: defaults.baud });
    client.setID(defaults.address);


    readReg(client, 0).then(function(voltage) {
        console.log(voltage);
    });

}


