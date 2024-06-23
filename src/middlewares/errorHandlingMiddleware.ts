import { Request, Response, NextFunction } from "express";
import { ApiError } from "../utils/handlers/apiError";

export const errorHandlerMiddleware = (err: ApiError , req: Request, res: Response, next: NextFunction) => {
    console.log(err);
    const statusCode = err.statusCode || 500;
    const message = err.message || 'Internal Server Error';

    res.status(statusCode).json({
        status: 'error',
        statusCode: statusCode,
        message: message
    });
}