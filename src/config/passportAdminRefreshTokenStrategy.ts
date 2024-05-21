import { Strategy as JwtStrategy, StrategyOptions } from "passport-jwt";
import passport from "passport";
import { User } from "../models/user";
import { Request } from "express";

export const adminRefreshTokenStrategy = async (passport: passport.PassportStatic) => {
    const options: StrategyOptions = {
        jwtFromRequest : RefreshTokenExtractor,
        secretOrKey: process.env.REFRESH_ADMIN_SECRET as string
    }

    const strategy = new JwtStrategy(options, async(payload: any, done: passport.DoneCallback) => {
        try{
            const user = await User.findOne({
                where : {
                    id: payload.id
                }
            })
            if(user){
                const sanitizedUser = {...user.toJSON()};
                return done(null, sanitizedUser);
            }
            return done('No User Found', {})
        }catch(error){
            return done(error, {});
        }
    });

    passport.use('admin-refresh-token', strategy);
}

const RefreshTokenExtractor = (req: Request) => {
    let token = null;
    if(req && req.cookies){
        token = req.cookies.refreshToken;
    }

    return token;
}