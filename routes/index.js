const express = require('express');
const router = express.Router();
const salt = 'q8YVxW6NOz';
import puppeteer from 'puppeteer';
import ses from '../conn/ses'

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});


router.post('/', async function(req, res, next) {
    if(req.body.salt !== salt) return res.status(400)
        .json({ error: 'Invalid Credentials', error_description: 'Pass correct creds in request' });

    const randomPassword =  Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
    const randomEmail = `${randomPassword}@20minutemail.it`

    const browser = await puppeteer.launch({headless: false});
    const page = await browser.newPage();
    await page.setViewport({ width: 1366, height: 768});

    await page.goto('https://www.freeconferencecall.com/global/in', {waitUntil: 'networkidle2'});


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
    await page.waitFor(4000);

    await page.click('#logout-desktop');
    await browser.close();

    ses.sendTemplatedEmail({
        Source: `"QuezX.com" <${config.SMTP_USER}>`,
        Destination: {
            ToAddresses: ['darshit@quetzal.in'],
        },
        Template: 'h-cvshare-magiclinkexpired',
        TemplateData: JSON.stringify({
            jdOwnerName: name || '',
            candidateName: applicant.name,
            requestEmailId: cvShare.follower_email_id,
            role: job.role,
            location: job.job_location,
            link: `${config.PREFIX}hire.${config.DOMAIN}/applicants/${applicantId}`,
        }),
    }, (err, content) => {
        if (err) {
            console.log('err', err);
            return err;
        }
        return console.log('send', content);
    });

    return res.status(200)
        .json({ msg: 'Success', msg_description: 'Email sent successfully' });

});


module.exports = router;
