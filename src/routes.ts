
const errors = require('restify-errors');
import { logger } from './logger';
import { Context, extractEntities, isValidLanguage } from './data';

export function mount(server) {
    server.get('/text-extract-entities', function (req, res, next) {
        const context: Context = {
            text: req.query.text,
            lang: req.query.lang,
            country: req.query.country
        };

        callExtractEntities(res, context, next);
    });
}

function callExtractEntities(res, context: Context, next) {
    if (typeof context.text !== 'string' || context.text.trim().length < 2) {
        return next(new errors.BadRequestError('`text` param is invalid'));
    }
    if (typeof context.lang !== 'string' || !isValidLanguage(context.lang)) {
        return next(new errors.BadRequestError('`lang` param is invalid'));
    }

    extractEntities(context)
        .then(data => {
            res.send(formatResult(null, data));
            next();
        }).catch(error => {
            console.trace(error);
            next(error);
        });
}

function formatResult(error: any, data: any) {
    if (error) {
        return { error: error };
    }

    return {
        data: data
    };
}
