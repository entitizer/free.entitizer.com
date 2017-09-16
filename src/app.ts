
require('dotenv').config();

import * as express from 'express';
import { logger } from './logger';
import { mountRoutes } from './routes';
const cors = require('cors');
const bodyParser = require('body-parser');

const isProduction = process.env.NODE_ENV === 'production';

const app = express();

if (isProduction) {
    app.enable('trust proxy');
    app.disable('x-powered-by');
}
app.disable('etag');

app.use(cors());
app.use(bodyParser.json()); // to support JSON-encoded bodies
app.use(bodyParser.urlencoded({ // to support URL-encoded bodies
    extended: true
}));

mountRoutes(app);

app.all('*', function (req, res) {
    res.status(404).end();
});

app.listen(process.env.PORT, function () {
    console.log('%s listening at %s', app.name, process.env.PORT);
});

process.on('unhandledRejection', function (error: Error) {
    logger.error('unhandledRejection: ' + error.message, error);
});

process.on('uncaughtException', function (error: Error) {
    logger.error('uncaughtException: ' + error.message, error);
});
