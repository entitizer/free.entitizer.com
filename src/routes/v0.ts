import * as express from "express";
import { Request, Response, Router } from "express";
import { sendSuccess, sendError } from "../utils";
import {
  extractor,
  wikiEntityRepository,
  learningTextRepository
} from "../data";
import { uniq } from "@textactor/domain";
import { EResult } from "@textactor/ner";
import { WikiEntity } from "@textactor/wikientity-domain";
import { logger } from "@textactor/actor-domain/dest/logger";
import { LearningTextHelper } from "@textactor/concept-domain";
export const route: Router = express.Router();
const ms = require("ms");

const RateLimit = require("express-rate-limit");

const hourApiLimiter = new RateLimit({
  windowMs: ms("1h"),
  max: 100,
  delayMs: 0
});

const secondApiLimiter = new RateLimit({
  windowMs: 1000,
  max: 2,
  delayMs: 0
});

route.get(
  "/extract",
  secondApiLimiter,
  hourApiLimiter,
  (req: Request, res: Response) => {
    let input: InputParams;
    try {
      input = parseInput(req);
    } catch (e) {
      return sendError(res, 400, e.message);
    }

    extractAndSendResult(input, res);
  }
);

route.get("/key_extract", keyExtract);
route.post("/key_extract", keyExtract);

function keyExtract(req: Request, res: Response) {
  const key =
    req.query.key || req.headers["key"] || req.params.key || req.body.key;
  if (!key || key !== process.env.SECRET_KEY) {
    return sendError(res, 401, "Unauthorized");
  }
  let input: InputParams;
  try {
    input = parseInput(req);
  } catch (e) {
    return sendError(res, 400, e.message);
  }

  extractAndSendResult(input, res);
}

function extractAndSendResult(input: InputParams, res: Response) {
  const { lang, country, text, wikidata } = input;

  if (text && text.trim().length > 100) {
    learningTextRepository
      .put(LearningTextHelper.build({ lang, country, text }))
      .catch((e) => logger.error(e));
  }

  extractor
    .extract({ lang, text, country })
    .then(async (result) => {
      if (result) {
        result.entities.forEach((item) => item.entity && delete item.entity.id);
        if (wikidata) {
          (<any>result).wikidata = await getResultWikidata(lang, result);
        }
      }
      return result;
    })
    .then((result) => sendSuccess(res, result))
    .catch((e) => sendError(res, 500, e));
}

async function getResultWikidata(lang: string, result: EResult) {
  const LANG = lang.toUpperCase();
  const wikidata: { [index: string]: WikiEntity } = {};
  let ids = result.entities
    .filter((item) => item.entity && item.entity.wikiDataId)
    .map((item) => `${LANG}${item.entity.wikiDataId}`);
  if (ids.length) {
    ids = uniq(ids);
    ids = ids.slice(0, 20);
    const wikiEntities = await wikiEntityRepository.getByIds(ids);
    wikiEntities.forEach((item) => {
      delete item.id;
      delete item.createdAt;
      delete item.updatedAt;

      wikidata[item.wikiDataId] = item;
    });
  }
  return wikidata;
}

type InputParams = {
  lang: string;
  country: string;
  text: string;
  wikidata: boolean;
};

function parseInput(req: Request): InputParams {
  // console.log(JSON.stringify(req));
  let lang = req.query.lang || req.params.lang || (req.body && req.body.lang);
  let qsWikidata =
    req.query.wikidata ||
    req.params.wikidata ||
    (req.body && req.body.wikidata);
  if (typeof lang === "string") {
    lang = lang.toLowerCase();
  }

  if (typeof lang !== "string" || lang.length !== 2) {
    throw new Error(`field 'lang' is required`);
  }

  let text = req.query.text || req.params.text || (req.body && req.body.text);

  if (typeof text !== "string") {
    throw new Error(`field 'text' is required`);
  }

  if (text.length < 10) {
    throw new Error(`field 'text' is too short`);
  }

  if (text.length > 5000) {
    throw new Error(`field 'text' is too long`);
  }

  let country =
    req.query.country || req.params.country || (req.body && req.body.country);
  if (typeof country === "string") {
    country = country.toLowerCase();
  }

  if (typeof country !== "string" || country.length !== 2) {
    throw new Error(`field 'country' is required`);
  }

  return {
    lang,
    country,
    text,
    wikidata: ["true", "True", "1", "yes", "on"].indexOf(qsWikidata) > -1
  };
}
