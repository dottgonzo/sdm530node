let ModbusRTU = require("modbus-serial");
import * as pathExists from "path-exists";
import merge = require("json-add");
import * as Promise from "bluebird";
import * as async from "async";

import lsusbdev = require("lsusbdev");



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








class SdM {

    conf: Idefaults;
    constructor(conf?: Idefaults) {

        let that = this;
        if (conf) {

            merge(defaults, conf);

            if (defaults.hub) {
                lsusbdev().then(function(devis) {

                    for (let i = 0; i < devis.length; i++) {
                        if (devis[i].hub === defaults.hub) {
                            defaults.dev = devis[i].dev;
                        }
                    }
                    that.conf = defaults;
                }).catch(function() {
                    throw "NO USB FOR SDM";
                });
            }

        } else {

            that.conf = defaults;


        }
    }
    data() {

        let that = this;

        let client = new ModbusRTU();

        client.setID(that.conf.address);





            console.log(that.conf);


            function start() {


                console.log("start");
                client.readInputRegisters(0, 2).then(function(data) {
                    console.log("regdata", data)

                }).catch(function(err) {
                    console.log("regerr", err)

                });
            }






            client.connectRTU(that.conf.dev, { baudrate: that.conf.baud }, start);


    }
}






let regss = [
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

let regs = [
    {
        label: "volt",
        phase: 1,
        reg: 0
    }
];




export = SdM