
import * as express from 'express';
import { Request, Response } from 'express';
import { sendSuccess, sendError } from '../utils';
import { entitizer } from '../data';
export const route = express.Router();

const RateLimit = require('express-rate-limit');

const hourApiLimiter = new RateLimit({
    windowMs: 1 * 60 * 60 * 1000, // 1 hour
    max: 100,
    delayMs: 0 // disabled
});

// const dayApiLimiter = new RateLimit({
//     windowMs: 24 * 60 * 60 * 1000, // 24 hours
//     max: 1000,
//     delayMs: 0 // disabled
// });

route.get('/entitize', hourApiLimiter, (req: Request, res: Response) => {
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
