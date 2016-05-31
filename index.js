"use strict";
var ModbusRTU = require("modbus-serial");
var merge = require("json-add");
var Promise = require("bluebird");
var async = require("async");
var lsusbdev = require("lsusbdev");
var defaults = {
    baud: 9600,
    dev: "/dev/ttyUSB0",
    address: 1
};
function readReg(client, reg) {
    console.log("reg", reg);
    return new Promise(function (resolve, reject) {
        console.log("prom");
        client.readInputRegisters(reg, 2).then(function (data) {
            console.log("regdata", data);
            resolve(data.buffer.readFloatBE());
        }).catch(function (err) {
            console.log("regerr", err);
            reject(err);
        });
    });
}
var SdM = (function () {
    function SdM(conf) {
        var that = this;
        if (conf) {
            merge(defaults, conf);
            if (defaults.hub) {
                lsusbdev().then(function (devis) {
                    for (var i = 0; i < devis.length; i++) {
                        if (devis[i].hub === defaults.hub) {
                            defaults.dev = devis[i].dev;
                        }
                    }
                    that.conf = defaults;
                }).catch(function () {
                    throw "NO USB FOR SDM";
                });
            }
        }
        else {
            that.conf = defaults;
        }
    }
    SdM.prototype.data = function () {
        var that = this;
        var client = new ModbusRTU();
        client.setID(that.conf.address);
        return new Promise(function (resolve, reject) {
            console.log(defaults);
            function start() {
                console.log("start");
                var answer = {};
                async.each(regs, function (iterator, cb) {
                    readReg(client, iterator.reg).then(function (d) {
                        answer[iterator.label + iterator.phase] = d;
                        console.log(d);
                        cb();
                    }).catch(function (err) {
                        console.log(err);
                        cb();
                    });
                }, function (err) {
                    if (err) {
                        reject(err);
                    }
                    else {
                        resolve(answer);
                        console.log("log", answer);
                    }
                });
            }
            client.connectRTU(that.conf.dev, { baudrate: that.conf.baud }, start);
        });
    };
    return SdM;
}());
var regss = [
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
var regs = [
    {
        label: "volt",
        phase: 1,
        reg: 0
    }
];
module.exports = SdM;

//# sourceMappingURL=data:application/json;base64,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QUFJLElBQUksR0FBRztJQUNQO1FBQ0ksS0FBSyxFQUFFLE1BQU07UUFDYixLQUFLLEVBQUUsQ0FBQztRQUNSLEdBQUcsRUFBRSxDQUFDO0tBQ1Q7Q0FDSixDQUFDO0FBS0YsaUJBQVMsR0FBRyxDQUFBIiwiZmlsZSI6ImluZGV4LmpzIiwic291cmNlc0NvbnRlbnQiOlsibGV0IE1vZGJ1c1JUVSA9IHJlcXVpcmUoXCJtb2RidXMtc2VyaWFsXCIpO1xuaW1wb3J0ICogYXMgcGF0aEV4aXN0cyBmcm9tIFwicGF0aC1leGlzdHNcIjtcbmltcG9ydCBtZXJnZSA9IHJlcXVpcmUoXCJqc29uLWFkZFwiKTtcbmltcG9ydCAqIGFzIFByb21pc2UgZnJvbSBcImJsdWViaXJkXCI7XG5pbXBvcnQgKiBhcyBhc3luYyBmcm9tIFwiYXN5bmNcIjtcblxuaW1wb3J0IGxzdXNiZGV2ID0gcmVxdWlyZShcImxzdXNiZGV2XCIpO1xuXG5cblxuaW50ZXJmYWNlIElkZWZhdWx0cyB7XG4gICAgYmF1ZD86IG51bWJlcjtcbiAgICBkZXY/OiBzdHJpbmc7XG4gICAgYWRkcmVzcz86IG51bWJlcjtcbiAgICBodWI/OiBzdHJpbmc7XG59XG5cbmxldCBkZWZhdWx0cyA9IDxJZGVmYXVsdHM+e1xuICAgIGJhdWQ6IDk2MDAsXG4gICAgZGV2OiBcIi9kZXYvdHR5VVNCMFwiLFxuICAgIGFkZHJlc3M6IDFcbn07XG5cblxuZnVuY3Rpb24gcmVhZFJlZyhjbGllbnQsIHJlZzogbnVtYmVyKSB7XG4gICAgY29uc29sZS5sb2coXCJyZWdcIiwgcmVnKVxuICAgIHJldHVybiBuZXcgUHJvbWlzZShmdW5jdGlvbihyZXNvbHZlLCByZWplY3QpIHtcbiAgICAgICAgY29uc29sZS5sb2coXCJwcm9tXCIpXG4gICAgICAgIGNsaWVudC5yZWFkSW5wdXRSZWdpc3RlcnMocmVnLCAyKS50aGVuKGZ1bmN0aW9uKGRhdGEpIHtcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKFwicmVnZGF0YVwiLCBkYXRhKVxuICAgICAgICAgICAgcmVzb2x2ZShkYXRhLmJ1ZmZlci5yZWFkRmxvYXRCRSgpKTtcbiAgICAgICAgfSkuY2F0Y2goZnVuY3Rpb24oZXJyKSB7XG4gICAgICAgICAgICBjb25zb2xlLmxvZyhcInJlZ2VyclwiLCBlcnIpXG4gICAgICAgICAgICByZWplY3QoZXJyKTtcbiAgICAgICAgfSk7XG4gICAgfSk7XG5cbn1cblxuXG5cblxuXG5jbGFzcyBTZE0ge1xuXG4gICAgY29uZjogSWRlZmF1bHRzO1xuICAgIGNvbnN0cnVjdG9yKGNvbmY/OiBJZGVmYXVsdHMpIHtcblxuICAgICAgICBsZXQgdGhhdCA9IHRoaXM7XG4gICAgICAgIGlmIChjb25mKSB7XG5cbiAgICAgICAgICAgIG1lcmdlKGRlZmF1bHRzLCBjb25mKTtcblxuICAgICAgICAgICAgaWYgKGRlZmF1bHRzLmh1Yikge1xuICAgICAgICAgICAgICAgIGxzdXNiZGV2KCkudGhlbihmdW5jdGlvbihkZXZpcykge1xuXG4gICAgICAgICAgICAgICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgZGV2aXMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChkZXZpc1tpXS5odWIgPT09IGRlZmF1bHRzLmh1Yikge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRlZmF1bHRzLmRldiA9IGRldmlzW2ldLmRldjtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB0aGF0LmNvbmYgPSBkZWZhdWx0cztcbiAgICAgICAgICAgICAgICB9KS5jYXRjaChmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICAgICAgICAgdGhyb3cgXCJOTyBVU0IgRk9SIFNETVwiO1xuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgIH0gZWxzZSB7XG5cbiAgICAgICAgICAgIHRoYXQuY29uZiA9IGRlZmF1bHRzO1xuXG5cbiAgICAgICAgfVxuICAgIH1cbiAgICBkYXRhKCkge1xuXG4gICAgICAgIGxldCB0aGF0ID0gdGhpcztcblxuICAgICAgICBsZXQgY2xpZW50ID0gbmV3IE1vZGJ1c1JUVSgpO1xuXG4gICAgICAgIGNsaWVudC5zZXRJRCh0aGF0LmNvbmYuYWRkcmVzcyk7XG5cbiAgICAgICAgcmV0dXJuIG5ldyBQcm9taXNlKGZ1bmN0aW9uKHJlc29sdmUsIHJlamVjdCkge1xuXG5cblxuICAgICAgICAgICAgY29uc29sZS5sb2coZGVmYXVsdHMpO1xuXG5cbiAgICAgICAgICAgIGZ1bmN0aW9uIHN0YXJ0KCkge1xuXG5cbiAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhcInN0YXJ0XCIpO1xuICAgICAgICAgICAgICAgIGxldCBhbnN3ZXIgPSB7fTtcblxuICAgICAgICAgICAgICAgIGFzeW5jLmVhY2gocmVncywgZnVuY3Rpb24oaXRlcmF0b3IsIGNiKSB7XG4gICAgICAgICAgICAgICAgICAgIHJlYWRSZWcoY2xpZW50LCBpdGVyYXRvci5yZWcpLnRoZW4oZnVuY3Rpb24oZCkge1xuXG4gICAgICAgICAgICAgICAgICAgICAgICBhbnN3ZXJbaXRlcmF0b3IubGFiZWwgKyBpdGVyYXRvci5waGFzZV0gPSBkO1xuXG4gICAgICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhkKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGNiKCk7XG4gICAgICAgICAgICAgICAgICAgIH0pLmNhdGNoKGZ1bmN0aW9uKGVycikge1xuICAgICAgICAgICAgICAgICAgICAgICAgY29uc29sZS5sb2coZXJyKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGNiKCk7XG4gICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgIH0sIGZ1bmN0aW9uKGVycikge1xuXG4gICAgICAgICAgICAgICAgICAgIGlmIChlcnIpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJlamVjdChlcnIpO1xuICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgcmVzb2x2ZShhbnN3ZXIpO1xuICAgICAgICAgICAgICAgICAgICAgICAgY29uc29sZS5sb2coXCJsb2dcIiwgYW5zd2VyKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgIH1cblxuXG5cblxuXG5cbiAgICAgICAgICAgIGNsaWVudC5jb25uZWN0UlRVKHRoYXQuY29uZi5kZXYsIHsgYmF1ZHJhdGU6IHRoYXQuY29uZi5iYXVkIH0sIHN0YXJ0KTtcbiAgICAgICAgfSk7XG5cbiAgICB9XG59XG5cblxuXG5cblxuXG5sZXQgcmVnc3MgPSBbXG4gICAge1xuICAgICAgICBsYWJlbDogXCJ2b2x0XCIsXG4gICAgICAgIHBoYXNlOiAxLFxuICAgICAgICByZWc6IDBcbiAgICB9LFxuICAgIHtcbiAgICAgICAgbGFiZWw6IFwidm9sdFwiLFxuICAgICAgICBwaGFzZTogMixcbiAgICAgICAgcmVnOiAyXG4gICAgfSxcbiAgICB7XG4gICAgICAgIGxhYmVsOiBcInZvbHRcIixcbiAgICAgICAgcGhhc2U6IDMsXG4gICAgICAgIHJlZzogNFxuICAgIH0sXG4gICAge1xuICAgICAgICBsYWJlbDogXCJjdXJyZW50XCIsXG4gICAgICAgIHBoYXNlOiAxLFxuICAgICAgICByZWc6IDZcbiAgICB9LFxuICAgIHtcbiAgICAgICAgbGFiZWw6IFwiY3VycmVudFwiLFxuICAgICAgICBwaGFzZTogMixcbiAgICAgICAgcmVnOiA4XG4gICAgfSxcbiAgICB7XG4gICAgICAgIGxhYmVsOiBcImN1cnJlbnRcIixcbiAgICAgICAgcGhhc2U6IDMsXG4gICAgICAgIHJlZzogMTBcbiAgICB9LFxuICAgIHtcbiAgICAgICAgbGFiZWw6IFwicG93ZXJcIixcbiAgICAgICAgcGhhc2U6IDEsXG4gICAgICAgIHJlZzogMTJcbiAgICB9LFxuICAgIHtcbiAgICAgICAgbGFiZWw6IFwicG93ZXJcIixcbiAgICAgICAgcGhhc2U6IDIsXG4gICAgICAgIHJlZzogMTRcbiAgICB9LFxuICAgIHtcbiAgICAgICAgbGFiZWw6IFwicG93ZXJcIixcbiAgICAgICAgcGhhc2U6IDMsXG4gICAgICAgIHJlZzogMTZcbiAgICB9LFxuICAgIHtcbiAgICAgICAgbGFiZWw6IFwiZnJlcXVlbmN5XCIsXG4gICAgICAgIHBoYXNlOiAwLFxuICAgICAgICByZWc6IDcwXG4gICAgfSxcbiAgICB7XG4gICAgICAgIGxhYmVsOiBcInRvdGFsUG93ZXJcIixcbiAgICAgICAgcGhhc2U6IDAsXG4gICAgICAgIHJlZzogNTJcbiAgICB9LFxuICAgIHtcbiAgICAgICAgbGFiZWw6IFwiYWxsUG93ZXJcIixcbiAgICAgICAgcGhhc2U6IDAsXG4gICAgICAgIHJlZzogNzRcbiAgICB9XG5dO1xuXG5sZXQgcmVncyA9IFtcbiAgICB7XG4gICAgICAgIGxhYmVsOiBcInZvbHRcIixcbiAgICAgICAgcGhhc2U6IDEsXG4gICAgICAgIHJlZzogMFxuICAgIH1cbl07XG5cblxuXG5cbmV4cG9ydCA9IFNkTSJdLCJzb3VyY2VSb290IjoiL3NvdXJjZS8ifQ==
