
import { Response } from 'express';

export function sendSuccess(res: Response, data: any) {
    const result = {
        data: data
    };

    res.send(result);
}

export function sendError(res: Response, status: number, error: any) {
    const result = {
        error: error
    };

    res.status(status).send(result);
}
