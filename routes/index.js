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


     return email.send(mailOptions)
         .then(info => res.status(201).json(info))
         .catch(err => res.status(500).json(err));
});


module.exports = router;
