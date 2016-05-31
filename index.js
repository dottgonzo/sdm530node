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
    return new Promise(function (resolve, reject) {
        client.readInputRegisters(reg, 2).then(function (data) {
            resolve(data.buffer.readFloatBE());
        }).catch(function (err) {
            reject(err);
        });
    });
}
var SdM = (function () {
    function SdM(conf) {
        this.client = new ModbusRTU();
        var that = this;
        if (conf) {
            merge(defaults, require("./conf.json"));
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
        var regs = [
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
        var that = this;
        return new Promise(function (resolve, reject) {
            function start() {
                var answer = {};
                async.eachSeries(regs, function (iterator, cb) {
                    readReg(that.client, iterator.reg).then(function (d) {
                        answer[iterator.label + iterator.phase] = d;
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
                        that.client.close(function (err) {
                            resolve(answer);
                        });
                    }
                });
            }
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
    }
];
module.exports = SdM;

//# sourceMappingURL=data:application/json;base64,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QUtGLGlCQUFTLEdBQUcsQ0FBQSIsImZpbGUiOiJpbmRleC5qcyIsInNvdXJjZXNDb250ZW50IjpbImxldCBNb2RidXNSVFUgPSByZXF1aXJlKFwibW9kYnVzLXNlcmlhbFwiKTtcbmltcG9ydCAqIGFzIHBhdGhFeGlzdHMgZnJvbSBcInBhdGgtZXhpc3RzXCI7XG5pbXBvcnQgbWVyZ2UgPSByZXF1aXJlKFwianNvbi1hZGRcIik7XG5pbXBvcnQgKiBhcyBQcm9taXNlIGZyb20gXCJibHVlYmlyZFwiO1xuaW1wb3J0ICogYXMgYXN5bmMgZnJvbSBcImFzeW5jXCI7XG5cbmltcG9ydCBsc3VzYmRldiA9IHJlcXVpcmUoXCJsc3VzYmRldlwiKTtcblxuXG5cbmludGVyZmFjZSBJZGVmYXVsdHMge1xuICAgIGJhdWQ/OiBudW1iZXI7XG4gICAgZGV2Pzogc3RyaW5nO1xuICAgIGFkZHJlc3M/OiBudW1iZXI7XG4gICAgaHViPzogc3RyaW5nO1xufVxuXG5sZXQgZGVmYXVsdHMgPSA8SWRlZmF1bHRzPntcbiAgICBiYXVkOiA5NjAwLFxuICAgIGRldjogXCIvZGV2L3R0eVVTQjBcIixcbiAgICBhZGRyZXNzOiAxXG59O1xuXG5cblxuXG5mdW5jdGlvbiByZWFkUmVnKGNsaWVudCwgcmVnOiBudW1iZXIpIHtcblxuXG4gICAgcmV0dXJuIG5ldyBQcm9taXNlKGZ1bmN0aW9uKHJlc29sdmUsIHJlamVjdCkge1xuICAgICAgICBjbGllbnQucmVhZElucHV0UmVnaXN0ZXJzKHJlZywgMikudGhlbihmdW5jdGlvbihkYXRhKSB7XG5cblxuICAgICAgICAgICAgcmVzb2x2ZShkYXRhLmJ1ZmZlci5yZWFkRmxvYXRCRSgpKTtcbiAgICAgICAgfSkuY2F0Y2goZnVuY3Rpb24oZXJyKSB7XG4gICAgICAgICAgICByZWplY3QoZXJyKTtcbiAgICAgICAgfSk7XG4gICAgfSk7XG5cbn1cblxuXG5cbmNsYXNzIFNkTSB7XG4gICAgY2xpZW50O1xuICAgIGNvbmY6IElkZWZhdWx0cztcbiAgICBjb25zdHJ1Y3Rvcihjb25mPzogSWRlZmF1bHRzKSB7XG5cbiAgICAgICAgdGhpcy5jbGllbnQgPSBuZXcgTW9kYnVzUlRVKCk7XG4gICAgICAgIGxldCB0aGF0ID0gdGhpcztcbiAgICAgICAgaWYgKGNvbmYpIHtcblxuICAgICAgICAgICAgbWVyZ2UoZGVmYXVsdHMsIHJlcXVpcmUoXCIuL2NvbmYuanNvblwiKSk7XG5cbiAgICAgICAgICAgIHRoYXQuY2xpZW50LnNldElEKGRlZmF1bHRzLmFkZHJlc3MpO1xuXG5cbiAgICAgICAgICAgIGlmIChkZWZhdWx0cy5odWIpIHtcbiAgICAgICAgICAgICAgICBsc3VzYmRldigpLnRoZW4oZnVuY3Rpb24oZGV2aXMpIHtcblxuICAgICAgICAgICAgICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IGRldmlzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoZGV2aXNbaV0uaHViID09PSBkZWZhdWx0cy5odWIpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBkZWZhdWx0cy5kZXYgPSBkZXZpc1tpXS5kZXY7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgdGhhdC5jb25mID0gZGVmYXVsdHM7XG4gICAgICAgICAgICAgICAgfSkuY2F0Y2goZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgICAgICAgIHRocm93IFwiTk8gVVNCIEZPUiBTRE1cIjtcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgdGhhdC5jbGllbnQuc2V0SUQoZGVmYXVsdHMuYWRkcmVzcyk7XG4gICAgICAgICAgICB0aGF0LmNvbmYgPSBkZWZhdWx0cztcblxuXG4gICAgICAgIH1cbiAgICB9XG4gICAgZGF0YSgpIHtcblxuICAgICAgICBsZXQgcmVncyA9IFtcbiAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICBsYWJlbDogXCJ2b2x0XCIsXG4gICAgICAgICAgICAgICAgcGhhc2U6IDEsXG4gICAgICAgICAgICAgICAgcmVnOiAwXG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgIGxhYmVsOiBcInZvbHRcIixcbiAgICAgICAgICAgICAgICBwaGFzZTogMixcbiAgICAgICAgICAgICAgICByZWc6IDJcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgbGFiZWw6IFwidm9sdFwiLFxuICAgICAgICAgICAgICAgIHBoYXNlOiAzLFxuICAgICAgICAgICAgICAgIHJlZzogNFxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICBsYWJlbDogXCJjdXJyZW50XCIsXG4gICAgICAgICAgICAgICAgcGhhc2U6IDEsXG4gICAgICAgICAgICAgICAgcmVnOiA2XG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgIGxhYmVsOiBcImN1cnJlbnRcIixcbiAgICAgICAgICAgICAgICBwaGFzZTogMixcbiAgICAgICAgICAgICAgICByZWc6IDhcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgbGFiZWw6IFwiY3VycmVudFwiLFxuICAgICAgICAgICAgICAgIHBoYXNlOiAzLFxuICAgICAgICAgICAgICAgIHJlZzogMTBcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgbGFiZWw6IFwicG93ZXJcIixcbiAgICAgICAgICAgICAgICBwaGFzZTogMSxcbiAgICAgICAgICAgICAgICByZWc6IDEyXG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgIGxhYmVsOiBcInBvd2VyXCIsXG4gICAgICAgICAgICAgICAgcGhhc2U6IDIsXG4gICAgICAgICAgICAgICAgcmVnOiAxNFxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICBsYWJlbDogXCJwb3dlclwiLFxuICAgICAgICAgICAgICAgIHBoYXNlOiAzLFxuICAgICAgICAgICAgICAgIHJlZzogMTZcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgbGFiZWw6IFwiZnJlcXVlbmN5XCIsXG4gICAgICAgICAgICAgICAgcGhhc2U6IDAsXG4gICAgICAgICAgICAgICAgcmVnOiA3MFxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICBsYWJlbDogXCJ0b3RhbFBvd2VyXCIsXG4gICAgICAgICAgICAgICAgcGhhc2U6IDAsXG4gICAgICAgICAgICAgICAgcmVnOiA1MlxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICBsYWJlbDogXCJhbGxQb3dlclwiLFxuICAgICAgICAgICAgICAgIHBoYXNlOiAwLFxuICAgICAgICAgICAgICAgIHJlZzogNzRcbiAgICAgICAgICAgIH1cbiAgICAgICAgXTtcblxuXG5cblxuICAgICAgICBsZXQgdGhhdCA9IHRoaXM7XG5cblxuXG4gICAgICAgIHJldHVybiBuZXcgUHJvbWlzZShmdW5jdGlvbihyZXNvbHZlLCByZWplY3QpIHtcblxuXG4gICAgICAgICAgICBmdW5jdGlvbiBzdGFydCgpIHtcblxuXG5cblxuICAgICAgICAgICAgICAgIGxldCBhbnN3ZXIgPSB7fTtcblxuICAgICAgICAgICAgICAgIGFzeW5jLmVhY2hTZXJpZXMocmVncywgZnVuY3Rpb24oaXRlcmF0b3IsIGNiKSB7XG5cbiAgICAgICAgICAgICAgICAgICAgcmVhZFJlZyh0aGF0LmNsaWVudCwgaXRlcmF0b3IucmVnKS50aGVuKGZ1bmN0aW9uKGQpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGFuc3dlcltpdGVyYXRvci5sYWJlbCArIGl0ZXJhdG9yLnBoYXNlXSA9IGQ7XG4gICAgICAgICAgICAgICAgICAgICAgICBjYigpO1xuICAgICAgICAgICAgICAgICAgICB9KS5jYXRjaChmdW5jdGlvbihlcnIpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKGVycik7XG4gICAgICAgICAgICAgICAgICAgICAgICBjYigpO1xuICAgICAgICAgICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgICAgIH0sIGZ1bmN0aW9uKGVycikge1xuXG4gICAgICAgICAgICAgICAgICAgIGlmIChlcnIpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJlamVjdChlcnIpO1xuICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgdGhhdC5jbGllbnQuY2xvc2UoZnVuY3Rpb24oZXJyKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcmVzb2x2ZShhbnN3ZXIpO1xuXG4gICAgICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgIH1cblxuXG4gICAgICAgICAgICB0aGF0LmNsaWVudC5jb25uZWN0UlRVKHRoYXQuY29uZi5kZXYsIHsgYmF1ZHJhdGU6IHRoYXQuY29uZi5iYXVkIH0sIHN0YXJ0KTtcbiAgICAgICAgfSk7XG5cbiAgICB9XG59XG5cblxuXG5cblxuXG5cbmxldCByZWdzcyA9IFtcbiAgICB7XG4gICAgICAgIGxhYmVsOiBcInZvbHRcIixcbiAgICAgICAgcGhhc2U6IDEsXG4gICAgICAgIHJlZzogMFxuICAgIH0sXG4gICAge1xuICAgICAgICBsYWJlbDogXCJ2b2x0XCIsXG4gICAgICAgIHBoYXNlOiAyLFxuICAgICAgICByZWc6IDJcbiAgICB9XG5dO1xuXG5cblxuXG5leHBvcnQgPSBTZE0iXSwic291cmNlUm9vdCI6Ii9zb3VyY2UvIn0=
