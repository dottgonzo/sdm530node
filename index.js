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
var SdM = (function () {
    function SdM(conf) {
        this.client = new ModbusRTU();
        var that = this;
        if (conf) {
            merge(defaults, conf);
            that.client.setID(defaults.address);
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
            that.client.setID(defaults.address);
            that.conf = defaults;
        }
    }
    SdM.prototype.data = function () {
        var that = this;
        function readReg(reg) {
            console.log("reg", reg);
            return new Promise(function (resolve, reject) {
                that.client.readInputRegisters(reg, 2).then(function (data) {
                    console.log("regdata", data);
                    resolve(data.buffer.readFloatBE());
                }).catch(function (err) {
                    console.log("regerr", err);
                    reject(err);
                });
            });
        }
        return new Promise(function (resolve, reject) {
            function start() {
                console.log("start");
                var answer = {};
                async.each(regs, function (iterator, cb) {
                    readReg(iterator.reg).then(function (d) {
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
            console.log(defaults);
            that.client.connectRTU(that.conf.dev, { baudrate: that.conf.baud }, start);
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

//# sourceMappingURL=data:application/json;base64,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QUFFLEVBQUU7S0FDVjtDQUNKLENBQUM7QUFFRixJQUFJLElBQUksR0FBRztJQUNQO1FBQ0ksS0FBSyxFQUFFLE1BQU07UUFDYixLQUFLLEVBQUUsQ0FBQztRQUNSLEdBQUcsRUFBRSxDQUFDO0tBQ1Q7Q0FDSixDQUFDO0FBS0YsaUJBQVMsR0FBRyxDQUFBIiwiZmlsZSI6ImluZGV4LmpzIiwic291cmNlc0NvbnRlbnQiOlsibGV0IE1vZGJ1c1JUVSA9IHJlcXVpcmUoXCJtb2RidXMtc2VyaWFsXCIpO1xuaW1wb3J0ICogYXMgcGF0aEV4aXN0cyBmcm9tIFwicGF0aC1leGlzdHNcIjtcbmltcG9ydCBtZXJnZSA9IHJlcXVpcmUoXCJqc29uLWFkZFwiKTtcbmltcG9ydCAqIGFzIFByb21pc2UgZnJvbSBcImJsdWViaXJkXCI7XG5pbXBvcnQgKiBhcyBhc3luYyBmcm9tIFwiYXN5bmNcIjtcblxuaW1wb3J0IGxzdXNiZGV2ID0gcmVxdWlyZShcImxzdXNiZGV2XCIpO1xuXG5cblxuaW50ZXJmYWNlIElkZWZhdWx0cyB7XG4gICAgYmF1ZD86IG51bWJlcjtcbiAgICBkZXY/OiBzdHJpbmc7XG4gICAgYWRkcmVzcz86IG51bWJlcjtcbiAgICBodWI/OiBzdHJpbmc7XG59XG5cbmxldCBkZWZhdWx0cyA9IDxJZGVmYXVsdHM+e1xuICAgIGJhdWQ6IDk2MDAsXG4gICAgZGV2OiBcIi9kZXYvdHR5VVNCMFwiLFxuICAgIGFkZHJlc3M6IDFcbn07XG5cblxuY2xhc3MgU2RNIHtcbiAgICBjbGllbnQ7XG4gICAgY29uZjogSWRlZmF1bHRzO1xuICAgIGNvbnN0cnVjdG9yKGNvbmY/OiBJZGVmYXVsdHMpIHtcblxuICAgICAgICB0aGlzLmNsaWVudCA9IG5ldyBNb2RidXNSVFUoKTtcbiAgICAgICAgbGV0IHRoYXQgPSB0aGlzO1xuICAgICAgICBpZiAoY29uZikge1xuXG4gICAgICAgICAgICBtZXJnZShkZWZhdWx0cyxjb25mKTtcblxuICAgICAgICAgICAgdGhhdC5jbGllbnQuc2V0SUQoZGVmYXVsdHMuYWRkcmVzcyk7XG5cblxuICAgICAgICAgICAgaWYgKGRlZmF1bHRzLmh1Yikge1xuICAgICAgICAgICAgICAgIGxzdXNiZGV2KCkudGhlbihmdW5jdGlvbihkZXZpcykge1xuXG4gICAgICAgICAgICAgICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgZGV2aXMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChkZXZpc1tpXS5odWIgPT09IGRlZmF1bHRzLmh1Yikge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRlZmF1bHRzLmRldiA9IGRldmlzW2ldLmRldjtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB0aGF0LmNvbmYgPSBkZWZhdWx0cztcbiAgICAgICAgICAgICAgICB9KS5jYXRjaChmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICAgICAgICAgdGhyb3cgXCJOTyBVU0IgRk9SIFNETVwiO1xuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICB0aGF0LmNsaWVudC5zZXRJRChkZWZhdWx0cy5hZGRyZXNzKTtcbiAgICAgICAgICAgIHRoYXQuY29uZiA9IGRlZmF1bHRzO1xuXG5cbiAgICAgICAgfVxuICAgIH1cbiAgICBkYXRhKCkge1xuXG4gICAgICAgIGxldCB0aGF0ID0gdGhpcztcblxuICAgICAgICBmdW5jdGlvbiByZWFkUmVnKHJlZzogbnVtYmVyKSB7XG4gICAgICAgICAgICBjb25zb2xlLmxvZyhcInJlZ1wiLHJlZylcbiAgICAgICAgICAgIHJldHVybiBuZXcgUHJvbWlzZShmdW5jdGlvbihyZXNvbHZlLCByZWplY3QpIHtcbiAgICAgICAgICAgICAgICB0aGF0LmNsaWVudC5yZWFkSW5wdXRSZWdpc3RlcnMocmVnLCAyKS50aGVuKGZ1bmN0aW9uKGRhdGEpIHtcbiAgICAgICAgICAgICAgICAgICAgY29uc29sZS5sb2coXCJyZWdkYXRhXCIsZGF0YSlcbiAgICAgICAgICAgICAgICAgICAgcmVzb2x2ZShkYXRhLmJ1ZmZlci5yZWFkRmxvYXRCRSgpKTtcbiAgICAgICAgICAgICAgICB9KS5jYXRjaChmdW5jdGlvbihlcnIpIHtcbiAgICAgICAgICAgICAgICAgICAgY29uc29sZS5sb2coXCJyZWdlcnJcIixlcnIpXG4gICAgICAgICAgICAgICAgICAgIHJlamVjdChlcnIpO1xuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgfVxuXG5cbiAgICAgICAgcmV0dXJuIG5ldyBQcm9taXNlKGZ1bmN0aW9uKHJlc29sdmUsIHJlamVjdCkge1xuXG5cbiAgICAgICAgICAgIGZ1bmN0aW9uIHN0YXJ0KCkge1xuICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKFwic3RhcnRcIilcbiAgICAgICAgICAgICAgICBsZXQgYW5zd2VyID0ge307XG5cbiAgICAgICAgICAgICAgICBhc3luYy5lYWNoKHJlZ3MsIGZ1bmN0aW9uKGl0ZXJhdG9yLCBjYikge1xuICAgICAgICAgICAgICAgICAgICByZWFkUmVnKGl0ZXJhdG9yLnJlZykudGhlbihmdW5jdGlvbihkKSB7XG5cbiAgICAgICAgICAgICAgICAgICAgICAgIGFuc3dlcltpdGVyYXRvci5sYWJlbCArIGl0ZXJhdG9yLnBoYXNlXSA9IGQ7XG5cbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKGQpO1xuICAgICAgICAgICAgICAgICAgICAgICAgY2IoKTtcbiAgICAgICAgICAgICAgICAgICAgfSkuY2F0Y2goZnVuY3Rpb24oZXJyKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhlcnIpO1xuICAgICAgICAgICAgICAgICAgICAgICAgY2IoKTtcbiAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgfSwgZnVuY3Rpb24oZXJyKSB7XG5cbiAgICAgICAgICAgICAgICAgICAgaWYgKGVycikge1xuICAgICAgICAgICAgICAgICAgICAgICAgcmVqZWN0KGVycik7XG4gICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICByZXNvbHZlKGFuc3dlcik7XG5jb25zb2xlLmxvZyhcImxvZ1wiLGFuc3dlcik7XG4gICAgICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICB9XG5cbmNvbnNvbGUubG9nKGRlZmF1bHRzKVxuXG4gICAgICAgICAgICB0aGF0LmNsaWVudC5jb25uZWN0UlRVKHRoYXQuY29uZi5kZXYsIHsgYmF1ZHJhdGU6IHRoYXQuY29uZi5iYXVkIH0sIHN0YXJ0KTtcbiAgICAgICAgfSk7XG5cbiAgICB9XG59XG5cblxuXG5cblxuXG5sZXQgcmVnc3MgPSBbXG4gICAge1xuICAgICAgICBsYWJlbDogXCJ2b2x0XCIsXG4gICAgICAgIHBoYXNlOiAxLFxuICAgICAgICByZWc6IDBcbiAgICB9LFxuICAgIHtcbiAgICAgICAgbGFiZWw6IFwidm9sdFwiLFxuICAgICAgICBwaGFzZTogMixcbiAgICAgICAgcmVnOiAyXG4gICAgfSxcbiAgICB7XG4gICAgICAgIGxhYmVsOiBcInZvbHRcIixcbiAgICAgICAgcGhhc2U6IDMsXG4gICAgICAgIHJlZzogNFxuICAgIH0sXG4gICAge1xuICAgICAgICBsYWJlbDogXCJjdXJyZW50XCIsXG4gICAgICAgIHBoYXNlOiAxLFxuICAgICAgICByZWc6IDZcbiAgICB9LFxuICAgIHtcbiAgICAgICAgbGFiZWw6IFwiY3VycmVudFwiLFxuICAgICAgICBwaGFzZTogMixcbiAgICAgICAgcmVnOiA4XG4gICAgfSxcbiAgICB7XG4gICAgICAgIGxhYmVsOiBcImN1cnJlbnRcIixcbiAgICAgICAgcGhhc2U6IDMsXG4gICAgICAgIHJlZzogMTBcbiAgICB9LFxuICAgIHtcbiAgICAgICAgbGFiZWw6IFwicG93ZXJcIixcbiAgICAgICAgcGhhc2U6IDEsXG4gICAgICAgIHJlZzogMTJcbiAgICB9LFxuICAgIHtcbiAgICAgICAgbGFiZWw6IFwicG93ZXJcIixcbiAgICAgICAgcGhhc2U6IDIsXG4gICAgICAgIHJlZzogMTRcbiAgICB9LFxuICAgIHtcbiAgICAgICAgbGFiZWw6IFwicG93ZXJcIixcbiAgICAgICAgcGhhc2U6IDMsXG4gICAgICAgIHJlZzogMTZcbiAgICB9LFxuICAgIHtcbiAgICAgICAgbGFiZWw6IFwiZnJlcXVlbmN5XCIsXG4gICAgICAgIHBoYXNlOiAwLFxuICAgICAgICByZWc6IDcwXG4gICAgfSxcbiAgICB7XG4gICAgICAgIGxhYmVsOiBcInRvdGFsUG93ZXJcIixcbiAgICAgICAgcGhhc2U6IDAsXG4gICAgICAgIHJlZzogNTJcbiAgICB9LFxuICAgIHtcbiAgICAgICAgbGFiZWw6IFwiYWxsUG93ZXJcIixcbiAgICAgICAgcGhhc2U6IDAsXG4gICAgICAgIHJlZzogNzRcbiAgICB9XG5dO1xuXG5sZXQgcmVncyA9IFtcbiAgICB7XG4gICAgICAgIGxhYmVsOiBcInZvbHRcIixcbiAgICAgICAgcGhhc2U6IDEsXG4gICAgICAgIHJlZzogMFxuICAgIH1cbl07XG5cblxuXG5cbmV4cG9ydCA9IFNkTSJdLCJzb3VyY2VSb290IjoiL3NvdXJjZS8ifQ==
