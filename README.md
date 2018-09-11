# logfailmap
A module for extracting and locating IPs that failed to login to a Linux machine
Note that logfailmap uses [ipstack](https://ipstack.com), which requires an API key. The free tier allows 10000 requests per month.


### Features
* Retrieve IPs of machines that failed to connect to the machine from bad login logfile (btmp)
* Obtain geographical data about the IP addresses

### Dependencies
* [request](http://github.com/request/request) - Simple HTTP request client
* [stream-splitter](http://github.com/samcday/node-stream-splitter) - Library for splitting streams
* Standard Unix utilities (sh, last, awk)

### Installation
`npm install logfailmap`

##### Example usage
```js
var logfailmap = require("logfailmap");
var apiKey = xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx;  // IPStack API key

logfailmap("/var/log/auth.log", apiKey, function(attempts) {
    //Use the attempts object
});
```

##### Attempts object
The attempts object contains one key/value pair for the date and time the information was retrieved. The rest of the keys are the IP addresses that failed to connect. The values are objects containing the geographical information for each IP, as well as the number of login attempts. Geographical information is obtained from [ipstack](https://ipstack.com/) and some IP addresses have less information available than others (e.g., no city). For example,
```js
{ date: 'Sat Aug 08 2015 14:00:44 GMT-0400 (EDT)',
  connections: 
   { '8.8.8.8': 
       { longitude: -122.0838,
         latitude: 37.386,
         ip: '8.8.8.8',
         city: 'Mountain View',
         metro_code: 807,
         time_zone: 'America/Los_Angeles',
         region_name: 'California',
         country_code: 'US',
         country_name: 'United States',
         country_code: 'US',
         region_code: 'CA',
         zip_code: '94040',
         attempts: 5 },
    '134.170.188.221': 
       { longitude: -97,
         latitude: 38,
         ip: '134.170.188.221',
         metro_code: 0,
         country_code: 'US',
         country_name: 'United States' }
    }
}
```
