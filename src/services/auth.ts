import sequelize from "sequelize";
import { User } from "../models/user";
import { UserAuthSettings } from "../models/userAuthSettings";
import { Op } from "sequelize";
import { sign } from "jsonwebtoken";
import dayjs from "dayjs";
import { UserTokens } from "../models/userTokens";
import {
  getDifferenceOfTwoDatesInTime,
  userPayloadFunction,
} from "../utils/common";
import {
  userDataReturn,
  CookieOptions,
  AuthCookieOptions,
  userPayload,
  Tokens,
} from "../types/dbtypes";
import { Response } from "express";
import { hash, compare } from "bcrypt";

export const generateTokens = (user: userPayload, role: string): Tokens => {
  const { id, username, email, name } = user;

  const JWT_SECRET =
    role == "ADMIN" ? process.env.ADMIN_SECRET : process.env.CLIENT_SECRET;
  const REFRESH_JWT_SECRET =
    role == "ADMIN"
      ? process.env.REFRESH_ADMIN_SECRET
      : process.env.REFRESH_CLIENT_SECRET;

  const payload = {
    id: id,
    username: username,
    email: email,
    name: name,
  };

  const token = sign(payload, JWT_SECRET as string, {
    expiresIn: process.env.JWT_EXPIRATION,
  });

  const refreshToken = sign(payload, REFRESH_JWT_SECRET as string, {
    expiresIn: process.env.REFRESH_TOKEN_EXPIRATION,
  });

  return { token, refreshToken };
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

    let user = await User.findOne(where);

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
    const userPayloadData = userPayloadFunction(userData);

    let tokens;
    if (role == "ADMIN") {
      tokens = await generateTokens(userPayloadData, role);
    } else if (role == "CLIENT") {
      tokens = await generateTokens(userPayloadData, role);
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

    let expire = dayjs().add(Number(process.env.EXPIRES_IN), "day");

    let existingToken = await UserTokens.findOne({
      where: {
        userId: user.id,
      },
    });

    if (existingToken) {
      await UserTokens.update(
        {
          refreshToken: tokens?.refreshToken,
          refreshTokenExpiredTime: expire.toDate(),
          isRefreshTokenExpired: false,
        },
        {
          where: {
            userId: user.id,
          },
        }
      );
    } else {
      await UserTokens.create({
        userId: user.id,
        refreshToken: tokens?.refreshToken,
        refreshTokenExpiredTime: expire.toDate(),
        isRefreshTokenExpired: false,
        addedBy: user.id,
      });
    }

    let userToReturn: userDataReturn = {
      userdata: { ...userData },
      token: tokens?.token as string,
      refreshToken: tokens?.refreshToken as string,
    };

    return {
      flag: false,
      data: userToReturn,
    };
  } catch (error) {
    console.log("Error: " + error);
  }
};

export const setAuthCookies = (
  res: Response,
  token: string,
  refreshToken: string,
  options: AuthCookieOptions = {}
) => {
  const defaultOptions: CookieOptions = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production", // Ensure cookies are only sent over HTTPS in production
    sameSite: "strict", // Adjust according to your needs ('lax' or 'none' if cross-site)
  };

  const tokenOptions: CookieOptions = {
    ...defaultOptions,
    maxAge: 1000 * 60 * 15, // Example: 15 minutes for token
    ...options.tokenOptions,
  };

  const refreshTokenOptions: CookieOptions = {
    ...defaultOptions,
    maxAge: 1000 * 60 * 60 * 24, // Example: 1 day for refresh token
    ...options.refreshTokenOptions,
  };

  res.cookie("token", token, tokenOptions);
  res.cookie("refreshToken", refreshToken, refreshTokenOptions);
};

export const resetNewPassword = async (userId: number, newPassword: string) => {
  try {
    newPassword = await hash(newPassword, 12);

    let updatedUser = await User.update(
      {
        password: newPassword,
        addedBy: userId,
        updatedBy: userId,
        updatedAt: dayjs(new Date()),
      },
      {
        where: {
          id: userId,
          isActive: true,
          isDeleted: false,
        },
      }
    );

    if (!updatedUser) {
      return {
        flag: true,
        data: "Failed to reset password...",
      };
    }

    await UserAuthSettings.update(
      {
        resetPasswordCode: "",
        expiredTimeOfResetPasswordCode: null,
        loginRetryLimit: 0,
        updatedAt: dayjs(new Date()),
        updatedBy: userId,
      },
      {
        where: {
          id: userId,
          isActive: true,
          isDeleted: false,
        },
      }
    );

    // mail to send password changed successfully...

    return {
      flag: false,
      data: "Password reset successfully",
    };
  } catch (error) {
    throw new Error("Server Error..." + error);
  }
};
