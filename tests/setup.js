jest.setTimeout(15000);

require('../models/User');

const mongoose = require('mongoose');
const { MONGO_URI } = require('./config');

mongoose.Promise = global.Promise;
mongoose.connect(MONGO_URI, { useMongoClient: true });
