const AWS = require('aws-sdk');
const uuid = require('uuid/v1');
const { accessKeyId, secretAccessKey } = require('../config/keys');
const requireLogin = require('../middlewares/requireLogin');

const putParams = Object.freeze({
  Bucket: 'udemy-advanced-node-blog',
  ContentType: 'image/jpeg',
});
const OPERATIONS = {
  PUT: 'putObject',
};

const s3 = new AWS.S3({
  accessKeyId,
  secretAccessKey,
});

module.exports = app => {
  app.get('/api/upload', requireLogin, (req, res) => {
    const key = `${req.user.id}/${uuid()}.jpeg`;
    const params = {
      Key: key,
      ...putParams,
    };
    s3.getSignedUrl(OPERATIONS.PUT, params, (err, url) => res.send({ key, url }));
  });
};
