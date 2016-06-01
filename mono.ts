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
    type?: string;
}

let defaults = <Idefaults>{
    baud: 9600,
    dev: "/dev/ttyUSB0",
    address: 1,
    type: "import"
};

interface Ireg {
    label: string;
    phase: number;
    reg: number;
    group: string;
}


function readReg(client, reg: number) {


    return new Promise(function(resolve, reject) {
        client.readInputRegisters(reg, 2).then(function(data) {


            resolve(data.buffer.readFloatBE());
        }).catch(function(err) {
            reject(err);
        });
    });

}



class SdM {
    client;
    latest;
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

    last() {
        return this.latest;
    }

    data(callback?: Function, interval?: number) {

        let regs: Ireg[];

        if (this.conf.type === "import") {
            regs = [
                {
                    label: "voltage",
                    phase: 1,
                    reg: 0,
                    group: "strings"
                },
                {
                    label: "voltage",
                    phase: 2,
                    reg: 2,
                    group: "strings"
                },
                {
                    label: "voltage",
                    phase: 3,
                    reg: 4,
                    group: "strings"
                },
                {
                    label: "current",
                    phase: 1,
                    reg: 6,
                    group: "strings"
                },
                {
                    label: "current",
                    phase: 2,
                    reg: 8,
                    group: "strings"
                },
                {
                    label: "current",
                    phase: 3,
                    reg: 10,
                    group: "strings"
                },
                {
                    label: "power",
                    phase: 1,
                    reg: 12,
                    group: "strings"
                },
                {
                    label: "power",
                    phase: 2,
                    reg: 14,
                    group: "strings"
                },
                {
                    label: "power",
                    phase: 3,
                    reg: 16,
                    group: "strings"
                },
                {
                    label: "hz",
                    phase: 0,
                    reg: 70,
                    group: "grid"
                },
                {
                    label: "power",
                    phase: 0,
                    reg: 52,
                    group: "grid"
                },
                {
                    label: "voltage",
                    phase: 0,
                    reg: 42,
                    group: "grid"
                },
                {
                    label: "current",
                    phase: 0,
                    reg: 46,
                    group: "grid"
                },
                {
                    label: "peakMax",
                    phase: 0,
                    reg: 86,
                    group: "main"
                },
                {
                    label: "totalEnergy",
                    phase: 0,
                    reg: 72,
                    group: "main"
                }
            ];
        } else if (this.conf.type === "export") {
            regs = [
                {
                    label: "voltage",
                    phase: 1,
                    reg: 0,
                    group: "strings"
                },
                {
                    label: "voltage",
                    phase: 2,
                    reg: 2,
                    group: "strings"
                },
                {
                    label: "voltage",
                    phase: 3,
                    reg: 4,
                    group: "strings"
                },
                {
                    label: "current",
                    phase: 1,
                    reg: 6,
                    group: "strings"
                },
                {
                    label: "current",
                    phase: 2,
                    reg: 8,
                    group: "strings"
                },
                {
                    label: "current",
                    phase: 3,
                    reg: 10,
                    group: "strings"
                },
                {
                    label: "power",
                    phase: 1,
                    reg: 12,
                    group: "strings"
                },
                {
                    label: "power",
                    phase: 2,
                    reg: 14,
                    group: "strings"
                },
                {
                    label: "power",
                    phase: 3,
                    reg: 16,
                    group: "strings"
                },
                {
                    label: "hz",
                    phase: 0,
                    reg: 70,
                    group: "grid"
                },
                {
                    label: "power",
                    phase: 0,
                    reg: 52,
                    group: "grid"
                },
                {
                    label: "voltage",
                    phase: 0,
                    reg: 42,
                    group: "grid"
                },
                {
                    label: "current",
                    phase: 0,
                    reg: 46,
                    group: "grid"
                },
                {
                    label: "peakMax",
                    phase: 0,
                    reg: 86,
                    group: "main"
                },
                {
                    label: "totalEnergy",
                    phase: 0,
                    reg: 74,
                    group: "main"
                }
            ];
        }





        let that = this;


        function start() {




            let answer = <any>{};

            async.eachSeries(regs, function(iterator, cb) {

                readReg(that.client, iterator.reg).then(function(d) {

                    if (iterator.group === "strings") {

                        if (!answer.strings) {
                            answer.strings = [];
                        }
                        if (!answer.strings[iterator.phase - 1]) {
                            answer.strings[iterator.phase - 1] = {};
                        }
                        answer.strings[iterator.phase - 1][iterator.label] = d;

                    } else if (iterator.group === "grid") {
                        if (!answer.grid) {
                            answer.grid = {};
                        }
                        answer.grid[iterator.label] = d;
                    } else if (iterator.group === "main") {
                        answer[iterator.label] = d;

                    }



                    cb();
                }).catch(function(err) {
                    cb(err);
                });

            }, function(err) {

                if (err) {
                    console.log(err);
                } else if (answer.grid.power && answer.grid.power > 0) {
                    if (callback) {
                        callback(answer);
                    }
                    that.latest = answer;
                }

            });

        }

        if (interval) {
            setInterval(function() {
                that.client.connectRTU(that.conf.dev, { baudrate: that.conf.baud }, start);

            }, interval);
        } else {
            that.client.connectRTU(that.conf.dev, { baudrate: that.conf.baud }, start);

        }


    }
}




export = SdM