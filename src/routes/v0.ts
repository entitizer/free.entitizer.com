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
import { WikiEntity, WikiEntityHelper } from "@textactor/wikientity-domain";
import { LearningTextHelper } from "@textactor/concept-domain";
import { logger } from "../logger";
import { Person, parse } from "quote-parser";
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

route.get(
  "/entity",
  secondApiLimiter,
  hourApiLimiter,
  async (req: Request, res: Response) => {
    try {
      const it = WikiEntityHelper.build({
        name: "Test",
        wikiDataId: req.query.id as string,
        lang: (req.query.lang as string) || "en",
        countLinks: 0
      });
      const entity = await wikiEntityRepository.getById(it.id);
      if (entity) {
        return sendSuccess(res, entity);
      } else {
        return sendError(res, 404, "Not found");
      }
    } catch (e) {
      return sendError(res, 400, e.message);
    }
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
  const { lang, country, text, wikidata, quotes } = input;

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
        if (quotes) {
          (<any>result).quotes = await getResultQuotes(text, lang, result);
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

async function getResultQuotes(text: string, lang: string, result: EResult) {
  const persons: Person[] = result.entities
    .filter(
      (item) =>
        item.entity && item.entity.type === "PERSON" && item.entity.wikiDataId
    )
    .map((item) =>
      item.input.map<Person>((it) => ({
        id: item.entity.wikiDataId,
        name: item.entity.name,
        index: it.index
      }))
    )
    .flat();

  if (persons.length === 0) {
    return [];
  }
  return parse(text, lang.toLowerCase(), { persons });
}

type InputParams = {
  lang: string;
  country: string;
  text: string;
  wikidata: boolean;
  quotes: boolean;
};

function parseInput(req: Request): InputParams {
  let lang = req.query.lang || req.params.lang || (req.body && req.body.lang);
  let qsWikidata =
    req.query.wikidata ||
    req.params.wikidata ||
    (req.body && req.body.wikidata);
  let qsQuotes =
    req.query.quotes || req.params.quotes || (req.body && req.body.quotes);
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
    wikidata: ["true", "True", "1", "yes", "on"].indexOf(qsWikidata) > -1,
    quotes: ["true", "True", "1", "yes", "on"].indexOf(qsQuotes) > -1
  };
}
