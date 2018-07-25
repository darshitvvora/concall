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

const express = require('express');
const he = require('he');
const puppeteer = require('puppeteer');
const rp = require('request-promise');

const { transport } = require('../components/email');
const config = require('../config');

const router = express.Router();
const salt = config.SALT;

async function conCallComplete(url, data) {
    return await rp({
        method: 'POST',
        uri: url,
        body: { ...data },
        json: true,
        headers: { 'User-Agent': 'Request-Promise' },
    });
}

/* GET home page. */
router.get('/', function(req, res) {
  res.render('index', { title: 'Welcome to concall api v0.0.1' });
});

router.post('/', async function(req, res) {
    try {
        if(req.body.salt !== salt) return res.status(400)
            .json({ error: 'Invalid Credentials', error_description: 'Pass correct creds in request' });

        const randomPassword =  Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
        const randomDomain =    Math.random().toString(36).substring(2, 7);
        const randomEmail = `${randomPassword}@${randomDomain}.com`;

        const proxy = await rp({
            method: 'GET',
            uri: config.PROXY_URI,
            json: true,
            headers: { 'User-Agent': 'Request-Promise' },
        });

        console.log(proxy.ip, proxy.port);

        let browser = await puppeteer.launch({
            headless: false,
            timeout: 0,
            args: [
                `--proxy-server=${proxy.ip}:${proxy.port}`, // Or whatever the address is
            ]
        });
        let textDialInNo = '';
        let textAccessCode = '';
        let textHostPin = '';
        try {
            const page = await browser.newPage();
            await page.setRequestInterception(true);

            page.on('request', (request) => {
               if (request.resourceType() === 'image') request.abort();
               else request.continue();
            });

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
            await page.waitForNavigation({ waitUntil: 'networkidle2' });

            await page.waitFor(12000);
            textDialInNo = await page.evaluate(() => document.querySelector('#acct_info_box > div:nth-child(1) > div.col-xs-6.align-right.text-nowrap > span.credentials-value').textContent);
            textAccessCode = await page.evaluate(() => document.querySelector('#acct_info_box > div:nth-child(5) > div.col-xs-7.align-right > span').textContent);
            textHostPin = await page.evaluate(() => document.querySelector('#acct_info_box > div:nth-child(7) > div.col-xs-8.align-right > span').textContent);

            console.log(textDialInNo);
            console.log(textAccessCode);
            console.log(textHostPin);

            await page.click('#extended-new-account-modal > div > div > div.modal-header > button > span:nth-child(1)');
            await page.waitFor(1000);

            await page.click('#logout-desktop');
            await browser.close();
        } catch (err) {
            console.log('pup error :', err);
            await browser.close();
            return res.status(500).json(err);
        }

        const htmlBody = req.body.mailOptions.html
            .replace('{{dialInNo}}', textDialInNo)
            .replace('{{accessCode}}', textAccessCode)
            .replace('{{hostPin}}', textHostPin)
            .replace('{{dateTime}}', req.body.dateTime);

        const stripedHtml = htmlBody.replace(/<[^>]+>/g, '');
        const textBody = he.decode(stripedHtml);

        const { from, to, bcc, subject } = req.body.mailOptions;

        console.log('To address ', to.length);
        const mailOptions = {
            from, // sender address
            bcc, // list of receivers
            subject, // Subject line
            text: textBody, // plain text body
            html: htmlBody // html body
        };

        const conCallDetails = {
            dateTime: req.body.dateTime,
            dialInNo: textDialInNo,
            accessCode: textAccessCode,
            hostPin: textHostPin,
            userId: req.body.userId,
        };

        return await Promise.all(to.map(v => transport.send({ ...mailOptions, to: v })))
            .then(async (info) => {
                // logger.log('Conc call created: ', data);
                if (req.body.callbackURL) await conCallComplete(req.body.callbackURL, conCallDetails);
                console.log('successs');
                return res.status(201).json({...conCallDetails, ...info})
            })
            .catch(async (err) => {
                // logger.error(err);
                if (req.body.callbackURL) await conCallComplete(req.body.callbackURL, conCallDetails);
                console.log('failed ', err);
                return res.status(500).json(err);
            });
    } catch (err) {
        console.log('catch ', err);
        return res.status(500).json(err);
    }
});


module.exports = router;
