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
    client;
    conf: Idefaults;
    constructor(conf?: Idefaults) {

        this.client = new ModbusRTU();
        let that = this;
        if (conf) {

            merge(defaults, require("./conf.json"));

            that.client.setID(defaults.address);


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
            that.client.setID(defaults.address);
            that.conf = defaults;


        }
    }
    data() {

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




        let that = this;



        return new Promise(function(resolve, reject) {


            function start() {


                function readReg(client, reg: number) {
                    console.log("reg")

                    return new Promise(function(resolve, reject) {
                        client.readInputRegisters(reg, 2).then(function(data) {
                            console.log(data)

                            resolve(data.buffer.readFloatBE());
                        }).catch(function(err) {
                            console.log(err)
                            reject(err);
                        });
                    });

                }


                console.log("start")

                let answer = {};

                async.eachSeries(regs, function(iterator, cb) {
                    setTimeout(function() {

                        readReg(that.client, iterator.reg).then(function(d) {

                            answer[iterator.label + iterator.phase] = d;

                            console.log(d);
                            cb();
                        }).catch(function(err) {
                            console.log(err);
                            cb();
                        });
                    }, 1000);

                }, function(err) {

                    if (err) {
                        reject(err);
                    } else {
                        resolve(answer);

                    }

                });

            }


            console.log(that.conf)
            that.client.connectRTU(that.conf.dev, { baudrate: that.conf.baud }, start);
        });

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
    }
];




export = SdM