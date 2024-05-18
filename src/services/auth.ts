import sequelize from "sequelize";
import { User } from "../models/user";
import { UserAuthSettings } from "../models/userAuthSettings";
import { Op } from "sequelize";
import { sign } from "jsonwebtoken";
import dayjs from "dayjs";
import { UserTokens } from "../models/userTokens";
import { getDifferenceOfTwoDatesInTime } from "../utils/common";

const generateToken = (userData: string, secret: string) => {
  const userDataNew = JSON.parse(userData);

  const payload = {
    id: userDataNew.id,
    username: userDataNew.username,
    email: userDataNew.email,
  };

  const options = {
    expiresIn: Number(process.env.EXPIRES_IN) * 60,
  };

  return sign(payload, secret, options);
};

export const loginUser = async (
  username: string,
  password: string,
  role: string
) => {
  try {
    let where: any = {};
    where[Op.or] = [
      { username: username },
      { email: username }, // Use 'email' if searching by email
    ];

    where.isActive = true;
    where.isDeleted = false;

    let user = await User.findOne({
      where: where,
    });

    if (!user) {
      return {
        flag: true,
        data: "User not exists",
      };
    }

    let userAuth = await UserAuthSettings.findOne({
      where: {
        userId: user.id,
      },
    });

    if (
      userAuth &&
      (userAuth?.loginRetryLimit ?? 0) >=
        Number(process.env.MAX_LOGIN_RETRY_LIMIT)
    ) {
      let now = dayjs();
      if (userAuth.loginReactiveTime) {
        let limitTime = dayjs(userAuth.loginReactiveTime);
        if (limitTime > now) {
          let expireTime = dayjs().add(
            Number(process.env.LOGIN_REACTIVE_TIME),
            "minute"
          );
          if (!(limitTime > expireTime)) {
            return {
              flag: true,
              data: `you have exceed the number of limit. You can login after ${getDifferenceOfTwoDatesInTime(
                now,
                limitTime
              )}.`,
            };
          }
          UserAuthSettings.update(
            {
              loginReactiveTime: expireTime.toDate(),
              loginRetryLimit: (userAuth.loginRetryLimit ?? 0) + 1,
            },
            {
              where: { userId: user.id },
            }
          );
          return {
            flag: true,
            data: `you have exceed the number of limit.you can login after ${getDifferenceOfTwoDatesInTime(
              now,
              expireTime
            )}.`,
          };
        } else {
          await UserAuthSettings.update(
            {
              loginReactiveTime: undefined,
              loginRetryLimit: (userAuth.loginRetryLimit ?? 0) + 1,
            },
            {
              where: { userId: user.id },
            }
          );
        }
      } else {
        let expireTime = dayjs().add(
          Number(process.env.LOGIN_REACTIVE_TIME),
          "minute"
        );
        UserAuthSettings.update(
          {
            loginReactiveTime: expireTime.toDate(),
            loginRetryLimit: (userAuth.loginRetryLimit ?? 0) + 1,
          },
          {
            where: { userId: user.id },
          }
        );
        return {
          flag: true,
          data: `you have exceed the number of limit.you can login after ${getDifferenceOfTwoDatesInTime(
            now,
            expireTime
          )}.`,
        };
      }
    }

    if (password) {
      let isPasswordMatch = await user.isPasswordMatch(password);
      if (!isPasswordMatch) {
        await UserAuthSettings.update(
          { loginRetryLimit: sequelize.literal('"loginRetryLimit" + 1') },
          { where: { userId: { [Op.eq]: user.id } } }
        );
        return {
          flag: true,
          data: "Incorrect Password",
        };
      }
    }

    const userData = user.toJSON();

    let token;
    let refreshToken;
    if (role == "ADMIN") {
      token = await generateToken(
        JSON.stringify(userData),
        process.env.ADMIN_SECRET as string
      );

      refreshToken = await generateToken(JSON.stringify(userData), process.env.REFRESH_ADMIN_SECRET as string)
    } else if (role == "CLIENT") {
      token = await generateToken(
        JSON.stringify(userData),
        process.env.CLIENT_SECRET as string
      );

      refreshToken = await generateToken(JSON.stringify(userData), process.env.REFRESH_CLIENT_SECRET as string)
    }

    if (userAuth && userAuth.loginRetryLimit) {
      await UserAuthSettings.update(
        {
          loginRetryLimit: 0,
          loginReactiveTime: undefined,
        },
        { where: { userId: { [Op.eq]: user.id } } }
      );
    }

    let expire = dayjs()
      .add(Number(process.env.EXPIRES_IN), "hours");

    let existingToken = await UserTokens.findOne({
      where: {
        userId: user.id
      }
    })

    if(existingToken){
      await UserTokens.update({
        refreshToken: refreshToken,
        refreshTokenExpiredTime : expire.toDate(),
        isRefreshTokenExpired: false,
      }, {
        where: {
          userId: user.id
        }
      })
    }else{
      await UserTokens.create({
        userId: user.id,
        refreshToken: refreshToken,
        refreshTokenExpiredTime : expire.toDate(),
        isRefreshTokenExpired: false,
        addedBy: user.id
      })
    }

    let userToReturn = {
      ...userData,
      token,
      refreshToken
    };

    return {
      flag: false,
      data: userToReturn,
    };
  } catch (error) {
    console.log("Error: " + error);
  }
};
