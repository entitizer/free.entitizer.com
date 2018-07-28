
import * as express from 'express';
import { Request, Response, Router } from 'express';
import { sendSuccess, sendError } from '../utils';
import { extractor, wikiEntityRepository } from '../data';
import { uniq } from '@textactor/domain';
import { EResult } from '@textactor/ner';
import { WikiEntity } from '@textactor/wikientity-domain';
export const route: Router = express.Router();
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

route.get('/extract', secondApiLimiter, hourApiLimiter, (req: Request, res: Response) => {
    let lang = req.query.lang || req.body && req.body.lang;
    let qsWikidata = req.query.wikidata || req.body && req.body.wikidata;
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

    if (typeof country !== 'string' || country.length !== 2) {
        return sendError(res, 400, { message: `field 'country' is required` });
    }

    extractor.extract({ lang, text, country })
        .then(async result => {
            if (result) {
                result.entities.forEach(item => item.entity && delete item.entity.id);
                if (~['true', 'True', '1', 'yes', 'on'].indexOf(qsWikidata)) {
                    (<any>result).wikidata = await getResultWikidata(lang, result);
                }
            }
            return result;
        })
        .then(result => sendSuccess(res, result))
        .catch(e => sendError(res, 500, e));
});

async function getResultWikidata(lang: string, result: EResult) {
    const LANG = lang.toUpperCase();
    const wikidata: { [index: string]: WikiEntity } = {};
    let ids = result.entities
        .filter(item => item.entity && item.entity.wikiDataId)
        .map(item => `${LANG}${item.entity.wikiDataId}`);
    if (ids.length) {
        ids = uniq(ids);
        ids = ids.slice(0, 20);
        const wikiEntities = await wikiEntityRepository.getByIds(ids);
        wikiEntities.forEach(item => {
            delete item.id;
            delete item.createdAt;
            delete item.updatedAt;

            wikidata[item.wikiDataId] = item;
        });
    }
    return wikidata;
}
