import { Response } from "express";
import { logger } from "./logger";

export function sendSuccess(res: Response, data: any) {
  const result = {
    data: data
  };

  res.send(result);
}

export function sendError(res: Response, status: number, error: any) {
  logger.error(error.message || JSON.stringify(error));
  const result = {
    error: { message: error.message }
  };

  res.status(status).send(result);
}
