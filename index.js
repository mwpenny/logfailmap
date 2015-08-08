//index.js
/* A script for extracting and locating IPs that failed to login to a Linux machine */

var fs = require("fs");
var request = require("request");

/* Add geographical information from IP address and add to connection attempt object */
var geolocate = function(connections, ip, callback) {
    request("https://www.telize.com/geoip/" + ip, function(err, res, body) {
        if (!err && res.statusCode == 200)
        {
            /* Copy number of attempts into new data object, then
               overwrite the old connection attempt object */ 
            var connection = JSON.parse(body);
            delete connection.ip; //Unnecessary. Key of connection object is IP
            connection.attempts = connections[ip].attempts;
            connections[ip] = connection;
        }
        callback();
    });
}

/* Get invalid user login IPs and attempt counts */
var getConnectionIPs = function(logfile, callback) {
    var connections = {};

    fs.readFile(logfile, "UTF-8", function(err, data) {
        if (err) return callback(err, connections);
        
        // Extract date, attempted username, and IP
        /*var re = /(\w{3}\s+\d{1,2}\s+\d{2}:\d{2}:\d{2}).*Invalid user (\S+?) from (.*)/g;
            x[1] == date
            x[2] == user
            x[3] == ip
        */

        //Helper function
        var incAttempts = function(connections, ip) {
            if (!connections.hasOwnProperty(ip))
                connections[ip] = { "attempts": 1 };
            else
                ++connections[ip].attempts;        
        }

        var re1 = /.*Invalid user \S+? from (.*)/g
        var re2 = /.*Received disconnect from (.*?):.*Auth fail/g
        var m;

        //Get invalid user attempts and straight auth fails
        while (m = re1.exec(data)) incAttempts(connections, m[1]);
        while (m = re2.exec(data)) incAttempts(connections, m[1]);
        
        return callback(null, connections);
    })
};

/* Get failed login/connection host IPs and their geographical information */
var getConnectionAttempts = function(logfile, callback) {
    getConnectionIPs(logfile, function(err, connections) {
        var IPs = Object.keys(connections);
        var located = 0;

        //Get location information for each IP
        for (var i = 0; i < IPs.length; ++i) {
            geolocate(connections, IPs[i], function() {
                if (++located === IPs.length)
                    return callback(connections);
            });
        }
    });
}

module.exports = getConnectionAttempts;
