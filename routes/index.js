/*
*
* Sample Request
* var request = require("request");

var options = { method: 'POST',
  url: 'http://localhost:3636/',
  headers:
   { 'postman-token': '83c00d9f-f8e1-dc6b-b953-9a0949efa4b8',
     'cache-control': 'no-cache',
     'content-type': 'application/json' },
  body:
   { salt: 'q8YVxW6NOz',
     mailOptions:
      { from: 'darshitvvora@gmail.com',
        to: 'demo@gmail.com',
        subject: 'Your Conference Call Details',
        html: '<div>Hello,<br>Details for your conference call is as below:<br></div><div><table style=\'font-family:arial, sans-serif;border-collapse:collapse;width:100%;\' > <tr> <th style=\'border-width:1px;border-style:solid;border-color:#dddddd;text-align:left;padding-top:8px;padding-bottom:8px;padding-right:8px;padding-left:8px;\' >Date Time</th> <td style=\'border-width:1px;border-style:solid;border-color:#dddddd;text-align:left;padding-top:8px;padding-bottom:8px;padding-right:8px;padding-left:8px;\' >14 July, 2017, 2:30 PM</td></tr><tr> <th style=\'border-width:1px;border-style:solid;border-color:#dddddd;text-align:left;padding-top:8px;padding-bottom:8px;padding-right:8px;padding-left:8px;\' >Dail In Number</th> <td style=\'border-width:1px;border-style:solid;border-color:#dddddd;text-align:left;padding-top:8px;padding-bottom:8px;padding-right:8px;padding-left:8px;\' >{{dialInNo}}</td></tr><tr> <th style=\'border-width:1px;border-style:solid;border-color:#dddddd;text-align:left;padding-top:8px;padding-bottom:8px;padding-right:8px;padding-left:8px;\' >Access Code</th> <td style=\'border-width:1px;border-style:solid;border-color:#dddddd;text-align:left;padding-top:8px;padding-bottom:8px;padding-right:8px;padding-left:8px;\' >{{accessCode}}</td></tr><tr> <th style=\'border-width:1px;border-style:solid;border-color:#dddddd;text-align:left;padding-top:8px;padding-bottom:8px;padding-right:8px;padding-left:8px;\' >HOST PIN</th> <td style=\'border-width:1px;border-style:solid;border-color:#dddddd;text-align:left;padding-top:8px;padding-bottom:8px;padding-right:8px;padding-left:8px;\' >{{hostPin}}</td></tr></table></div><br>Happy Calling!' },
     dateTime: 'Monday July 27, 2018',
     callbackUrl: 'http://api.quezx.test/concall' },
  json: true };

request(options, function (error, response, body) {
  if (error) throw new Error(error);

  console.log(body);
});
*
 */

import  express from 'express';
import he from 'he';
import puppeteer from 'puppeteer';
import rp from 'request-promise';
import email from '../components/email';
import config from '../config';

const router = express.Router();
const salt = config.SALT;

/* GET home page. */
router.get('/', function(req, res) {
  res.render('index', { title: 'Welcome to concall api v0.0.1' });
});


router.post('/', async function(req, res) {
    console.log(req.body.salt);
    if(req.body.salt !== salt) return res.status(400)
        .json({ error: 'Invalid Credentials', error_description: 'Pass correct creds in request' });

    const randomPassword =  Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
    const randomDomain =    Math.random().toString(36).substring(2, 7);
    const randomEmail = `${randomPassword}@${randomDomain}.com`

    const proxy = await rp({
        method: 'GET',
        uri: config.PROXY_URI,
        json: true,
        headers: { 'User-Agent': 'Request-Promise' },
    });

    console.log(proxy.ip, proxy.port);

    const browser = await puppeteer.launch({
        headless:false,
        timeout:0,
        args: [
            `--proxy-server=${proxy.ip}:${proxy.port}`, // Or whatever the address is
        ]
    });
    const page = await browser.newPage();
    await page.setViewport({ width: 1366, height: 768});

    await page.goto(config.CONCALL_HOST_URI, {waitUntil: 'networkidle2'});
    await page.waitFor(4000);

    console.log(page.url());

    // Type our query into the search bar
    await page.focus('#main_email');
    await page.type('#main_email',randomEmail);


    await page.focus('#password');
    await page.type('#password', randomPassword);

    // Submit form
    await page.click('#signupButton');

    // Wait for search results page to load
    await page.waitForNavigation({waitUntil: 'networkidle2'});

    await page.waitFor(12000);
    const textDialInNo = await page.evaluate(() => document.querySelector('#acct_info_box > div:nth-child(1) > div.col-xs-6.align-right.text-nowrap > span.credentials-value').textContent);
    const textAccessCode = await page.evaluate(() => document.querySelector('#acct_info_box > div:nth-child(5) > div.col-xs-7.align-right > span').textContent);
    const textHostPin = await page.evaluate(() => document.querySelector('#acct_info_box > div:nth-child(7) > div.col-xs-8.align-right > span').textContent);

    console.log(textDialInNo);
    console.log(textAccessCode);
    console.log(textHostPin);

    await page.click('#extended-new-account-modal > div > div > div.modal-header > button > span:nth-child(1)');
    await page.waitFor(1000);

    await page.click('#logout-desktop');
    await browser.close();



    const htmlBody = req.body.mailOptions.html
        .replace('{{dialInNo}}', textDialInNo)
        .replace('{{accessCode}}', textAccessCode)
        .replace('{{hostPin}}', textHostPin);


    const stripedHtml = htmlBody.replace(/<[^>]+>/g, '');
    const textBody = he.decode(stripedHtml);



     const mailOptions = {
         from: req.body.mailOptions.from, // sender address
         to: req.body.mailOptions.to, // list of receivers
         subject: req.body.mailOptions.subject, // Subject line
         text: textBody, // plain text body
         html: htmlBody // html body
     };

     const oConCallDetails ={
         dateTime:req.body.dateTime,
         dialInNo:textDialInNo,
         accessCode:textAccessCode,
         hostPin:textHostPin,
     };

     return email.send(mailOptions)
         .then(info => {
             if(req.body.callbackUrl)
                {
                 const callback = await
                    rp({
                        method: 'POST',
                        uri: req.body.callbackURL,
                        body: {...oConCallDetails, ...info},
                        json: true,
                        headers: { 'User-Agent': 'Request-Promise' },
                    })
                }

               return res.status(201).json({...oConCallDetails, ...info})
         })
         .catch(err => {
             if(req.body.callbackUrl)
             {
                 const callback = await
                 rp({
                     method: 'POST',
                     uri: req.body.callbackURL,
                     body: {...oConCallDetails, ...info},
                     json: true,
                     headers: { 'User-Agent': 'Request-Promise' },
                 })
             }

             return res.status(500).json(err)
         });
});


module.exports = router;
