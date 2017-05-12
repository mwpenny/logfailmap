//index.js
/* A script for extracting and locating IPs that failed to login to a Linux machine */

var fs = require("fs");
var request = require("request");
var spawn = require("child_process").spawn;
var streamSplitter = require("stream-splitter");

var MAX_CONCURRENT_CONNECTIONS = 10;


/* Add geographical information from IP address and add to connection attempt object */
var geolocate = function(connections, ip, cb) {
    request("https://www.freegeoip.net/json/" + ip, function(err, res, body) {
        if (!err && res.statusCode == 200)
        {
            /* Copy number of attempts into new data object, then
               overwrite the old connection attempt object */ 
            var connection = JSON.parse(body);
            connection.attempts = connections[ip].attempts;
            connections[ip] = connection;
        }
        cb();
    });
}

var batchLocate = function(connections, ips, start, cb) {
    // Batch retrieval of IP locations (so not too many simultaneous connections are made)
    var end = Math.min(start + MAX_CONCURRENT_CONNECTIONS, ips.length);
    var located = 0;
    for (var i = start; i < end; ++i) {
        geolocate(connections, ips[i], function() {
            // Finished batch
            if (++located === (end - start)) {
                if (i < ips.length)
                    batchLocate(connections, ips, i, cb);
                else
                    cb();
            }
        });
    }
}

var isValidIP = function(ip) {
    var split = ip.split(".");
    if (split.length != 4)
        return false;
    for (var i = 0; i < split.length; ++i) {
        var octet = split[i];
        if (isNaN(octet) || parseInt(octet) < 0 || parseInt(octet) > 255)
            return false;
    }
    return true;
}

/* Get invalid user login IPs and attempt counts */
var getConnectionIPs = function(btmp, cb) {
    var connections = {};

    // Get the list of bad login attempts, isolate for IP, then count duplicates
    var cmd = "last -i -f " + btmp + " | awk '{if (NF == 9) print $2; else if (NF == 10) print $3}'";
    var proc = spawn("sh", ["-c", cmd]);
    var stream = proc.stdout.pipe(streamSplitter("\n"));
    stream.encoding = "utf8";

    stream.on("token", function(ip) {
        if (isValidIP(ip)) {
            if (!connections.hasOwnProperty(ip))
                connections[ip] = { "attempts": 1 };
            else
                ++connections[ip].attempts;
        }
    });
    proc.on("exit", function(code) {
        cb(code != 0, connections);
    });
    proc.on("error", cb);
};

/* Get failed login/connection host IPs and their geographical information */
var getConnectionAttempts = function(btmp, cb) {
    var ret = {date: Date(), connections: {}};

    getConnectionIPs(btmp, function(err, connections) {
        var ips = Object.keys(connections);
        if (err || ips.length === 0)
            return cb(ret);

        //Get location information for each IP
        batchLocate(connections, ips, 0, function() {
            ret.connections = connections;
            cb(ret);
        });
    });
}

module.exports = getConnectionAttempts;
