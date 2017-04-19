
require('dotenv').config();

import { logger } from './logger';
import { Context, extractEntities } from './data';
import { mount } from './routes';
const restify = require('restify');
const plugins = require('restify-plugins');

const server = restify.createServer({
    name: 'entitizer',
    version: '1.0.0'
});

// server.use(restify.CORS());
server.use(plugins.acceptParser(server.acceptable));
server.use(plugins.queryParser());
// server.use(plugins.bodyParser());

mount(server);

server.listen(process.env.PORT, function () {
    console.log('%s listening at %s', server.name, server.url);
});
