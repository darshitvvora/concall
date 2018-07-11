'use strict';

var _express = require('express');

var _express2 = _interopRequireDefault(_express);

var _he = require('he');

var _he2 = _interopRequireDefault(_he);

var _puppeteer = require('puppeteer');

var _puppeteer2 = _interopRequireDefault(_puppeteer);

var _requestPromise = require('request-promise');

var _requestPromise2 = _interopRequireDefault(_requestPromise);

var _email = require('../components/email');

var _email2 = _interopRequireDefault(_email);

var _config = require('../config');

var _config2 = _interopRequireDefault(_config);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var router = _express2.default.Router();
var salt = _config2.default.SALT;

/* GET home page. */
router.get('/', function (req, res) {
    res.render('index', { title: 'Welcome to concall api v0.0.1' });
});

router.post('/', async function (req, res) {
    console.log(req.body.salt);
    if (req.body.salt !== salt) return res.status(400).json({ error: 'Invalid Credentials', error_description: 'Pass correct creds in request' });

    var randomPassword = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
    var randomDomain = Math.random().toString(36).substring(2, 7);
    var randomEmail = randomPassword + '@' + randomDomain + '.com';

    var proxy = await (0, _requestPromise2.default)({
        method: 'GET',
        uri: _config2.default.PROXY_URI,
        json: true,
        headers: { 'User-Agent': 'Request-Promise' }
    });

    console.log(proxy.ip, proxy.port);

    var browser = await _puppeteer2.default.launch({
        headless: false,
        timeout: 0,
        args: ['--proxy-server=' + proxy.ip + ':' + proxy.port]
    });
    var page = await browser.newPage();
    await page.setViewport({ width: 1366, height: 768 });

    await page.goto('https://www.freeconferencecall.com/global/in', { waitUntil: 'networkidle2' });
    await page.waitFor(4000);

    console.log(page.url());

    // Type our query into the search bar
    await page.focus('#main_email');
    await page.type('#main_email', randomEmail);

    await page.focus('#password');
    await page.type('#password', randomPassword);

    // Submit form
    await page.click('#signupButton');

    // Wait for search results page to load
    await page.waitForNavigation({ waitUntil: 'networkidle2' });

    await page.waitFor(12000);
    var textDialInNo = await page.evaluate(function () {
        return document.querySelector('#acct_info_box > div:nth-child(1) > div.col-xs-6.align-right.text-nowrap > span.credentials-value').textContent;
    });
    var textAccessCode = await page.evaluate(function () {
        return document.querySelector('#acct_info_box > div:nth-child(5) > div.col-xs-7.align-right > span').textContent;
    });
    var textHostPin = await page.evaluate(function () {
        return document.querySelector('#acct_info_box > div:nth-child(7) > div.col-xs-8.align-right > span').textContent;
    });

    console.log(textDialInNo);
    console.log(textAccessCode);
    console.log(textHostPin);

    await page.click('#extended-new-account-modal > div > div > div.modal-header > button > span:nth-child(1)');
    await page.waitFor(1000);

    await page.click('#logout-desktop');
    await browser.close();

    var htmlBody = req.body.mailOptions.html.replace('{{dialInNo}}', textDialInNo).replace('{{accessCode}}', textAccessCode).replace('{{hostPin}}', textHostPin);

    var stripedHtml = htmlBody.replace(/<[^>]+>/g, '');
    var textBody = _he2.default.decode(stripedHtml);

    var mailOptions = {
        from: req.body.mailOptions.from, // sender address
        to: req.body.mailOptions.to, // list of receivers
        subject: req.body.mailOptions.subject, // Subject line
        text: textBody, // plain text body
        html: htmlBody // html body
    };

    return _email2.default.send(mailOptions).then(function (info) {
        return res.status(201).json(info);
    }).catch(function (err) {
        return res.status(500).json(err);
    });
});

module.exports = router;