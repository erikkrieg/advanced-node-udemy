const keys = require('../config/keys');
const isDev = process.env.ENV === 'dev';

module.exports = {
  DOMAIN: 'http://localhost:3000',
  // When running with dev, the tests occur outside the docker compose network
  // which requires a different URI than the application server uses.
  // While run in CI the correct URI is in the primary config file.
  MONGO_URI: isDev ? 'mongodb://localhost:27017/blog_dev' : key.mongoURI,
};
