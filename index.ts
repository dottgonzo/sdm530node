let ModbusRTU = require("modbus-serial");

let moment = require("moment-timezone");

import * as pathExists from "path-exists";
import merge = require("json-add");
import * as Promise from "bluebird";
import * as async from "async";

import lsusbdev = require("lsusbdev");

let rpj = require("request-promise-json");

interface Iconf {
    baud?: number;
    dev?: string;
    address?: number;
    hub?: string;
    type?: string;
    uid: string;
    tz: string;
}

interface Idefaults {
    baud: number;
    dev: string;
    address: number;
    type: string;
    uid: string;
    hub?: string;
    tz: string;
}

let defaults = <Idefaults>{
    baud: 9600,
    dev: "/dev/ttyUSB0",
    address: 1,
    type: "import",
    tz: "GMT"
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
    conf: Iconf;
    validDate: boolean;
    constructor(conf?: Iconf) {
        this.validDate = false;
        this.checkDate();
        this.client = new ModbusRTU();
        let that = this;
        if (conf) {

            merge(defaults, conf);

            that.client.setID(defaults.address);


            if (conf.hub) {
                lsusbdev().then(function(devis) {

                    for (let i = 0; i < devis.length; i++) {
                        if (devis[i].hub === conf.hub) {
                            defaults.dev = devis[i].dev;
                        }
                    }
                    that.conf = defaults;
                }).catch(function() {
                    throw "NO USB FOR SDM";
                });
            } else {
                that.conf = defaults;

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

            let answer = <any>{
                uid: that.conf.uid,
                address: that.conf.address,
                model: "sdm530",
                firmware: require("./package.json").version,
                active: true,
                grid: {},
                strings: [],
                updatedAt: parseInt(moment.tz("GMT").format("x")),
                date: moment.tz(that.conf.tz).format("YYYYMMDD-HH:mm:ss"),
                _id: "data_" + that.conf.uid + "_" + parseInt(moment.tz(that.conf.tz).format("x"))
            };

            async.eachSeries(regs, function(iterator, cb) {

                readReg(that.client, iterator.reg).then(function(d) {

                    if (iterator.group === "strings") {


                        if (!answer.strings[iterator.phase - 1]) {
                            answer.strings[iterator.phase - 1] = {};
                        }
                        answer.strings[iterator.phase - 1][iterator.label] = d;

                    } else if (iterator.group === "grid") {

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
                    delete answer._id;
                } else if (that.validDate) {

                    that.latest = answer;
                } else {
                    delete answer._id;

                    console.log(answer);

                    console.log("malformed data");
                }
                if (callback) {
                    callback(answer);
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
    checkDate() {
        let that = this;
        function checkRemote() {
            rpj.get("https://io.kernel.online/date").then(function(date) {

                console.log(date);

                if (new Date().getTime() > (date.unixtime - 90000)) {
                    console.log("time is valid from now");
                    that.validDate = true;
                } else {
                    checkRemote();
                }

            }).catch(function(err) {
                console.log(err);
                checkRemote();
            });
        }

        checkRemote();
    }
}




export = SdM