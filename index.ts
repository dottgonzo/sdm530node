let ModbusRTU = require("modbus-serial");
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
    uid?: string;
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



function start(config, client) {

    return new Promise(function(resolve, reject) {
        let answer = <any>{};
        async.eachSeries(config.regs, function(iterator: any, cb) {

            readReg(client, iterator.reg).then(function(d) {

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
                reject(err);
            } else if (answer.grid.power && answer.grid.power > 0) {

                resolve(answer);
            }

        });
    });

}


class SdM {
    client;
    latest;
    conf: Idefaults[];
    constructor(conf?: Idefaults[]) {

        this.client = new ModbusRTU();
        let that = this;
        that.conf = [];

        if (conf) {
            for (let i = 0; i < conf.length; i++) {
                merge(defaults, conf[i]);
                if (defaults.hub) {
                    lsusbdev().then(function(devis) {

                        for (let i = 0; i < devis.length; i++) {
                            if (devis[i].hub === defaults.hub) {
                                defaults.dev = devis[i].dev;
                            }
                        }
                        that.conf.push(defaults);
                    }).catch(function() {
                        throw "NO USB FOR SDM";
                    });
                }
            }

        } else {
            that.conf.push(defaults);
        }
    }

    last() {
        return this.latest;
    }

    data(callback?: Function, interval?: number) {


        let that = this;

        let configs = [];
        let answers = [];

        for (let i = 0; i < this.conf.length; i++) {

            let regs: Ireg[];

            if (this.conf[i].type === "import") {
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
            } else if (this.conf[i].type === "export") {
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

            configs.push({ regs: regs, settings: that.conf[i] });
            answers.push({
                apiVersion: require("./package.json").version,
                address: that.conf[i].address,
                model: "sdm630",
                active: true,
                uid: that.conf[i].uid
            });
        }

        function todo() {


            async.eachSeries(configs, function(iterator, cb) {

                that.client.setID(iterator.settings.address);
                that.client.connectRTU(iterator.settings.dev, { baudrate: iterator.settings.baud }, start(iterator.settings, that.client).then(function(data) {
                    answers.push(data);
                    cb();
                }).catch(function(err) {
                    cb(err);
                }));


            }, function(err) {

                if (err) {
                    console.log(err);
                } else {
                    callback(answers);
                }
            });

        }

        if (interval) {
            setInterval(function() {

                todo();
            }, interval);
        } else {

            todo();

        }

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