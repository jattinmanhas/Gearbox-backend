import { Request, Response, NextFunction } from "express";
import { UserAttributes, UserTokenAttributes } from "../types/dbtypes";
import passport from "passport";

const verifyCallback =
  (
    req: Request,
    resolve: () => void,
    reject: (reason: string) => void
  ) =>
  async (err: Error, user: UserAttributes, info: any) => {
    if (err || info || !user) {
      return reject("Unauthorized User");
    }
    req.user = user;
    if (!user.isActive) {
      return reject("User is deactivated");
    }

    resolve();
  };

const authMiddleware =
  (role: string) => async (req: Request, res: Response, next: NextFunction) => {
    const authenticate = (rule: string) => new Promise<void>((resolve, reject) => {
        passport.authenticate(rule, { session: false }, verifyCallback(req, resolve, reject))(req, res, next);
      });
      try {
        if (role === 'ADMIN') {
          console.log(req.body)
            if(req.body.refreshToken === true){
              console.log("should only go in refresh token now");
              await authenticate('admin-refresh-token');
            }else{
              console.log("should not go here")
              await authenticate('admin-rule');
            }
        } else if (role === 'CLIENT') {
          await authenticate('client-rule');
        }
        next();
      } catch (err) {
        return res.sendStatus(401);
      }
  };

export default authMiddleware;
