import { Request, Response, NextFunction } from "express";

type AsyncRequestHander = (req: Request, res: Response, next: NextFunction) => Promise<any>

// export const asyncHandler = (requestHandler : AsyncRequestHander) => {
//     return (req: Request, res: Response, next: NextFunction) => {
//         Promise.resolve(requestHandler(req, res, next)).catch((err) => next(err))
//     }
// }

export const asyncHandler = (requestHandler: AsyncRequestHander) => async (req: Request, res: Response, next: NextFunction) => {
    try {
        return await requestHandler(req, res, next);
    } catch (error) {
        next(error);
    }
}