import { Strategy as JwtStrategy ,ExtractJwt, StrategyOptions } from "passport-jwt";
import passport from "passport";
import { User } from "../models/user";

export const adminPassportStrategy = async(passport: passport.PassportStatic) => {
    const options: StrategyOptions = {
        jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
        secretOrKey: process.env.ADMIN_SECRET as string,
    }

    const strategy = new JwtStrategy(options,  async(payload: any, done: passport.DoneCallback) => {
        try{
            const user = await User.findOne({
                where: {
                    id : payload.id
                }
            })

            if(user){
                const sanitizedUser = { ...user.toJSON() };
                return done(null, sanitizedUser);
            }
            return done('No User Found', {});
        }catch(error){
            return done(error, {});
        }
    });

    passport.use('admin-rule', strategy);
}