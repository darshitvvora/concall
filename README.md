# Self Service Conference Call API (Replace Skype for Business and integrate conference calls easily in your application)

## What is concall API?
Standalone API for generating PIN access-code and dial in number for conference calls similar to Skype for Business

### Local Installation and usage
- Clone the repository
- Use `npm install` to install the required packages
- Create .env file from sample.env
- npm start

### Integration with API
### Usage HTTP:
POST  HTTP/1.1
Host: localhost:3636
Content-Type: application/json
Cache-Control: no-cache
Payload: 
```js
{
	"salt": "q8YVgfgfxW6NOz",
	"mailOptions":{
		"from":"fromdemo@gmail.com",
		"to":"todemo@gmail.com",
		"subject":"Your Conference Call Details",
		"html":"<div>Hello,<br>Details for your conference call is as below:<br></div><div><table style='font-family:arial, sans-serif;border-collapse:collapse;width:100%;' > <tr> <th style='border-width:1px;border-style:solid;border-color:#dddddd;text-align:left;padding-top:8px;padding-bottom:8px;padding-right:8px;padding-left:8px;' >Date Time</th> <td style='border-width:1px;border-style:solid;border-color:#dddddd;text-align:left;padding-top:8px;padding-bottom:8px;padding-right:8px;padding-left:8px;' >14 July, 2017, 2:30 PM</td></tr><tr> <th style='border-width:1px;border-style:solid;border-color:#dddddd;text-align:left;padding-top:8px;padding-bottom:8px;padding-right:8px;padding-left:8px;' >Dail In Number</th> <td style='border-width:1px;border-style:solid;border-color:#dddddd;text-align:left;padding-top:8px;padding-bottom:8px;padding-right:8px;padding-left:8px;' >{{dialInNo}}</td></tr><tr> <th style='border-width:1px;border-style:solid;border-color:#dddddd;text-align:left;padding-top:8px;padding-bottom:8px;padding-right:8px;padding-left:8px;' >Access Code</th> <td style='border-width:1px;border-style:solid;border-color:#dddddd;text-align:left;padding-top:8px;padding-bottom:8px;padding-right:8px;padding-left:8px;' >{{accessCode}}</td></tr><tr> <th style='border-width:1px;border-style:solid;border-color:#dddddd;text-align:left;padding-top:8px;padding-bottom:8px;padding-right:8px;padding-left:8px;' >HOST PIN</th> <td style='border-width:1px;border-style:solid;border-color:#dddddd;text-align:left;padding-top:8px;padding-bottom:8px;padding-right:8px;padding-left:8px;' >{{hostPin}}</td></tr></table></div><br>Happy Calling!"
	}
}
```


### Usage PHP:
```php
<?php

$curl = curl_init();

curl_setopt_array($curl, array(
  CURLOPT_PORT => "3636",
  CURLOPT_URL => "http://localhost:3636/",
  CURLOPT_RETURNTRANSFER => true,
  CURLOPT_ENCODING => "",
  CURLOPT_MAXREDIRS => 10,
  CURLOPT_TIMEOUT => 30,
  CURLOPT_HTTP_VERSION => CURL_HTTP_VERSION_1_1,
  CURLOPT_CUSTOMREQUEST => "POST",
  CURLOPT_POSTFIELDS => "{\n\t\"salt\": \"q8YVxW6NOz\",\n\t\"mailOptions\":{\n\t\t\"from\":\"darshitvvora@gmail.com\",\n\t\t\"to\":\"demo@gmail.com\",\n\t\t\"subject\":\"Your Conference Call Details\",\n\t\t\"html\":\"<div>Hello,<br>Details for your conference call is as below:<br></div><div><table style='font-family:arial, sans-serif;border-collapse:collapse;width:100%;' > <tr> <th style='border-width:1px;border-style:solid;border-color:#dddddd;text-align:left;padding-top:8px;padding-bottom:8px;padding-right:8px;padding-left:8px;' >Date Time</th> <td style='border-width:1px;border-style:solid;border-color:#dddddd;text-align:left;padding-top:8px;padding-bottom:8px;padding-right:8px;padding-left:8px;' >14 July, 2017, 2:30 PM</td></tr><tr> <th style='border-width:1px;border-style:solid;border-color:#dddddd;text-align:left;padding-top:8px;padding-bottom:8px;padding-right:8px;padding-left:8px;' >Dail In Number</th> <td style='border-width:1px;border-style:solid;border-color:#dddddd;text-align:left;padding-top:8px;padding-bottom:8px;padding-right:8px;padding-left:8px;' >{{dialInNo}}</td></tr><tr> <th style='border-width:1px;border-style:solid;border-color:#dddddd;text-align:left;padding-top:8px;padding-bottom:8px;padding-right:8px;padding-left:8px;' >Access Code</th> <td style='border-width:1px;border-style:solid;border-color:#dddddd;text-align:left;padding-top:8px;padding-bottom:8px;padding-right:8px;padding-left:8px;' >{{accessCode}}</td></tr><tr> <th style='border-width:1px;border-style:solid;border-color:#dddddd;text-align:left;padding-top:8px;padding-bottom:8px;padding-right:8px;padding-left:8px;' >HOST PIN</th> <td style='border-width:1px;border-style:solid;border-color:#dddddd;text-align:left;padding-top:8px;padding-bottom:8px;padding-right:8px;padding-left:8px;' >{{hostPin}}</td></tr></table></div><br>Happy Calling!\"\n\t}\n}",
  CURLOPT_HTTPHEADER => array(
    "cache-control: no-cache",
    "content-type: application/json",
    "postman-token: 92f84086-2ff9-ec15-aac4-482e7741cd66"
  ),
));

$response = curl_exec($curl);
$err = curl_error($curl);

curl_close($curl);

if ($err) {
  echo "cURL Error #:" . $err;
} else {
  echo $response;
}
```

### Usage in NodeJS

`npm install --save request`

 ```js
var request = require("request");

var options = { method: 'POST',
  url: 'http://localhost:3636/',
  headers: 
   { 
     'cache-control': 'no-cache',
     'content-type': 'application/json' },
  body: 
   { salt: 'q8YVxW6NOz',
     mailOptions: 
      { from: 'darshitvvora@gmail.com',
        to: 'demo@gmail.com',
        subject: 'Your Conference Call Details',
        html: '<div>Hello,<br>Details for your conference call is as below:<br></div><div><table style=\'font-family:arial, sans-serif;border-collapse:collapse;width:100%;\' > <tr> <th style=\'border-width:1px;border-style:solid;border-color:#dddddd;text-align:left;padding-top:8px;padding-bottom:8px;padding-right:8px;padding-left:8px;\' >Date Time</th> <td style=\'border-width:1px;border-style:solid;border-color:#dddddd;text-align:left;padding-top:8px;padding-bottom:8px;padding-right:8px;padding-left:8px;\' >14 July, 2017, 2:30 PM</td></tr><tr> <th style=\'border-width:1px;border-style:solid;border-color:#dddddd;text-align:left;padding-top:8px;padding-bottom:8px;padding-right:8px;padding-left:8px;\' >Dail In Number</th> <td style=\'border-width:1px;border-style:solid;border-color:#dddddd;text-align:left;padding-top:8px;padding-bottom:8px;padding-right:8px;padding-left:8px;\' >{{dialInNo}}</td></tr><tr> <th style=\'border-width:1px;border-style:solid;border-color:#dddddd;text-align:left;padding-top:8px;padding-bottom:8px;padding-right:8px;padding-left:8px;\' >Access Code</th> <td style=\'border-width:1px;border-style:solid;border-color:#dddddd;text-align:left;padding-top:8px;padding-bottom:8px;padding-right:8px;padding-left:8px;\' >{{accessCode}}</td></tr><tr> <th style=\'border-width:1px;border-style:solid;border-color:#dddddd;text-align:left;padding-top:8px;padding-bottom:8px;padding-right:8px;padding-left:8px;\' >HOST PIN</th> <td style=\'border-width:1px;border-style:solid;border-color:#dddddd;text-align:left;padding-top:8px;padding-bottom:8px;padding-right:8px;padding-left:8px;\' >{{hostPin}}</td></tr></table></div><br>Happy Calling!' } },
  json: true };

request(options, function (error, response, body) {
  if (error) throw new Error(error);

  console.log(body);
});

 ```
 
 ## Contribute
Contributing is simple as cloning, making changes and submitting a pull request.
If you would like to contribute, here are a few starters:
- Bug Hunts
- More sorts of examples
- Additional features/ More integrations (This api has the minimum amount, but I don't mind having more data accessible to users)


## Legal
This code is in no way affiliated with, authorized, maintained, sponsored or endorsed by aby organisation or any of its affiliates or subsidiaries. This is an independent and unofficial software. Use at your own risk.

## Contributors

Thanks goes to these wonderful people ([emoji key](https://github.com/kentcdodds/all-contributors#emoji-key)):

<!-- ALL-CONTRIBUTORS-LIST:START - Do not remove or modify this section -->
<!-- prettier-ignore -->
<!-- ALL-CONTRIBUTORS-LIST:END -->

This project follows the [all-contributors](https://github.com/kentcdodds/all-contributors) specification. Contributions of any kind welcome!

