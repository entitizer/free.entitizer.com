
import * as express from 'express';
import { Request, Response } from 'express';
import { sendSuccess, sendError } from '../utils';
import { entitizer } from '../data';
import { Constants } from 'entitizer.entities';
export const route = express.Router();
const ms = require('ms');

const RateLimit = require('express-rate-limit');

const hourApiLimiter = new RateLimit({
    windowMs: ms('1h'),
    max: 100,
    delayMs: 0
});

const secondApiLimiter = new RateLimit({
    windowMs: 1000,
    max: 2,
    delayMs: 0
});

route.get('/entitize', secondApiLimiter, hourApiLimiter, (req: Request, res: Response) => {
    let lang = req.query.lang || req.body && req.body.lang;
    if (typeof lang === 'string') {
        lang = lang.toLowerCase();
    }

    if (typeof lang !== 'string' || lang.length !== 2) {
        return sendError(res, 400, { message: `field 'lang' is required` });
    }

    let text = req.query.text || req.body && req.body.text;

    if (typeof text !== 'string') {
        return sendError(res, 400, { message: `field 'text' is required` });
    }

    if (text.length < 10) {
        return sendError(res, 400, { message: `field 'text' is too short` });
    }

    if (text.length > 5000) {
        return sendError(res, 400, { message: `field 'text' is too long` });
    }

    let country = req.query.country || req.body && req.body.country;
    if (typeof country === 'string') {
        country = country.toLowerCase();
    }

    entitizer.entitize({ lang, text, country })
        .then(result => sendSuccess(res, result))
        .catch(e => sendError(res, 500, e));
});

route.get('/languages', hourApiLimiter, (req: Request, res: Response) => {
    sendSuccess(res, Constants.languages);
});
