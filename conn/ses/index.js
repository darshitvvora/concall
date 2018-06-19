import Bluebird from 'bluebird';
import aws from 'aws-sdk';
import config from '../../config';


const ses = new aws.SES({
  region: 'us-west-2',
  endpoint: config.AWSEndPoint,
  apiVersion: '2010-12-01',
  accessKeyId: config.AWSAccessKeyId,
  secretAccessKey: config.AWSSecretKey,
});

Bluebird.promisifyAll(Object.getPrototypeOf(ses));

module.exports = ses;
