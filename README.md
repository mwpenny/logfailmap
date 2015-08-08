# logfailmap
A module for extracting and locating IPs that failed to login to a Linux machine


### Features
* Retrieve IPs from logfiles of machines that failed to connect to the machine
* Obtain geographical data about the IP addresses

### Dependencies
* [request](http://github.com/request/request) - Simple HTTP request client

### Installation
`npm install logfailmap`

##### Example usage
```js
var logfailmap = require("logfailmap");

logfailmap("/var/log/auth.log", function(attempts) {
    //Use the attempts object
});
```

##### Attempts object
The keys of the attempts object are the IP addresses that failed to connect. The values are objects containing the geographical information for each IP, as well as the number of login attempts. Geographical information is obtained from [www.telize.com](http://www.telize.com/) and some IP addresses have less information available than others (e.g., no city). For example,
```js
{
'8.8.8.8': 
   { longitude: -122.0838,
     latitude: 37.386,
     asn: 'AS15169',
     offset: '-7',
     area_code: '0',
     continent_code: 'NA',
     dma_code: '0',
     city: 'Mountain View',
     timezone: 'America/Los_Angeles',
     region: 'California',
     country_code: 'US',
     isp: 'Google Inc.',
     postal_code: '94040',
     country: 'United States',
     country_code3: 'USA',
     region_code: 'CA',
     attempts: 5 },
'134.170.188.221': 
    { longitude: -97,
     latitude: 38,
     asn: 'AS8075',
     area_code: '0',
     continent_code: 'NA',
     dma_code: '0',
     country_code: 'US',
     isp: 'Microsoft Corporation',
     country: 'United States',
     country_code3: 'USA' }
}
```
