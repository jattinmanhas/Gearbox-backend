import { NextFunction, Request, Response } from "express";
import { User } from "../../models/user";
import sequelize from "../../database/dbConnection";
import {
  checkUsernameorEmailExists,
  generateResetToken,
  userPayloadFunction,
} from "../../utils/common";
import {
  generateTokens,
  loginUser,
  resetNewPassword,
  setAuthCookies,
} from "../../services/auth";
import { UserTokens } from "../../models/userTokens";
import {
  Tokens,
  UserAttributes,
  userDataReturn,
  userPayload,
} from "../../types/dbtypes";
import { UserAuthSettings } from "../../models/userAuthSettings";
import { getUserResetTokenAndDetails } from "../../utils/queries/userQueries";
import dayjs from "dayjs";
import { asyncHandler } from "../../utils/handlers/asyncHandler";
import { ApiResponse } from "../../utils/handlers/apiResponse";
import { ApiError } from "../../utils/handlers/apiError";
/**
 * @description : login with username and password
 * @param {Object} req : request for login
 * @param {Object} res : response for login
 * @return {Object} : response for login {status, message, data}
 */

export const login = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const { username, email, password } = req.body;

    if (username && email) {
      throw new ApiError(400, "Provide either username or email, not both.");
    }

    if (!username && !email) {
      throw new ApiError(400, "Provide either username or email.");
    }

    let login;

    if (username) {
      login = await loginUser(username, password, "ADMIN");
    } else {
      login = await loginUser(username, password, "ADMIN");
    }

    if (login?.flag) {
      throw new ApiError(400, login.data as string);
    }

    const loginData = login?.data as userDataReturn;
    const token = loginData.token;
    const refreshToken = loginData.refreshToken;

    console.log(token);
    console.log(refreshToken);
    // setAuthCookies(res, token, refreshToken); 
    console.log("inside cookie");
    res.cookie("auth cookie", "setting token cookie here...", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production", // Use secure cookies in production
    });

    return res.status(200).json(new ApiResponse(200, login?.data, "Login Successful"));
  }
);

/**
 * @description : user registration
 * @param {Object} req : request for register
 * @param {Object} res : response for register
 * @return {Object} : response for register {status, message, data}
 */

export const register = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    let transaction = await sequelize.transaction();

    let { username, password, email, name, mobileNo } = req.body;

    let usernameExists = await checkUsernameorEmailExists(username, "username");
    if (usernameExists) {
      if (transaction) await transaction.rollback();
      throw new ApiError(400, "Username Already exists...");
    }

    let emailExists = await checkUsernameorEmailExists(email, "email");
    if (emailExists) {
      if (transaction) await transaction.rollback();
      throw new ApiError(400, "Email already Exists...");
    }

    if (!usernameExists && !emailExists) {
      const newUser = await User.create({
        username: username,
        password: password,
        email: email,
        name: name,
        mobileNo: mobileNo,
      });

      if (newUser) {
        await transaction.commit();
        return res.status(200).json(new ApiResponse(
          200,
          req.body,
          "New user created successfully..."
        ));
      }
    }

    if (transaction) await transaction.rollback();
    throw new ApiError(200, "Failed to create User");
  }
);

/**
 * @description : logout user
 * @param {Object} req : request for logout
 * @param {Object} res : response for logout
 * @return {Object} : response for logout {status, message, data}
 */

export const logout = asyncHandler (async (req: Request, res: Response) => {
    const user = req.user as UserAttributes;
    const userId = user.id;

    res.clearCookie("token", { httpOnly: true });
    res.clearCookie("refreshToken", { httpOnly: true });

    let existingToken = await UserTokens.findOne({
      where: {
        userId: userId,
        isDeleted: false,
        isActive: true,
      },
    });

    if (existingToken) {
      let updateTokens = await UserTokens.update(
        {
          refreshToken: "",
          refreshTokenExpiredTime: new Date(),
          isRefreshTokenExpired: true,
          updatedBy: userId,
        },
        {
          where: {
            userId: userId,
            isDeleted: false,
            isActive: true,
          },
        }
      );

      if(updateTokens){
        return res.status(200).json(new ApiResponse(200, [], "Successfully Logged out..."));
      }
    }

    throw new ApiError(400, "Faild to Log Out...");
});

/**
 * @description : forgot Password
 * @param {Object} req : request for forgot password
 * @param {Object} res : response for forgot password
 * @return {Object} : response for forgot password {status, message, data}
 */

export const forgotPassword = asyncHandler (async (req: Request, res: Response) => {
    const { email } = req.body;

    const user = await User.findOne({ where: { email: email } });

    if (!user) {
      throw new ApiError(404, "User Not Found...");
    }

    const resetToken = await generateResetToken();
    const resetTokenExpiration = new Date(Date.now() + 60 * 60 * 1000); // 1hour

    const resetTokendbUpdate = await UserAuthSettings.update(
      {
        resetPasswordCode: resetToken,
        expiredTimeOfResetPasswordCode: resetTokenExpiration,
      },
      {
        where: {
          userId: user.id,
          isDeleted: false,
          isActive: true,
        },
      }
    );

    // send an email -> pending...

    if (resetTokendbUpdate) {
      return res.status(200).json(new ApiResponse(200, {email: email}, "Password change link sent to your Email successfully...Please Reset Your password from your email..."))
    }
});

/**
 * @description : Verifying Reset Token
 * @param {Object} req : request for Reset token
 * @param {Object} res : response for Reset token
 * @return {Object} : response for Reset token {status, message, data}
 */

export const verifyResetTokenToResetPassword = asyncHandler (async (
  req: Request,
  res: Response
) => {
    const { token } = req.params;
    if (!token) {
      throw new ApiError(400, "Password Reset Token is Missing");
    }

    const userData = await getUserResetTokenAndDetails(token);
    if (userData && userData.expiredTimeOfResetPasswordCode) {
      if (
        dayjs(new Date()).isAfter(
          dayjs(userData.expiredTimeOfResetPasswordCode)
        )
      ) {
        throw new ApiError(400, "Your reset password link is expired or invalid");
      }
    } else {
      throw new ApiError(400, "Invalid Token...");
    }

    return res.status(200).json(new ApiResponse(200, userData, "Token Verified..."));
});

/**
 * @description : Reset Password
 * @param {Object} req : request for Reset Password
 * @param {Object} res : response for Reset Password
 * @return {Object} : response for Reset Password {status, message, data}
 */

export const resetPassword = asyncHandler (async (req: Request, res: Response) => {
    const { token } = req.params;
    const { password } = req.body;

    if (!token) {
      throw new ApiError(404, "Password Reset Token is Missing...");
    }

    const userData = await getUserResetTokenAndDetails(token);
    if (userData && userData.expiredTimeOfResetPasswordCode) {
      if (
        dayjs(new Date()).isAfter(
          dayjs(userData.expiredTimeOfResetPasswordCode)
        )
      ) {
        // link expire
        throw new ApiError(400, "Your reset password link is expired or invalid");
      }
    } else {
      throw new ApiError(400, "Invalid Code");
    }

    let response = await resetNewPassword(userData.id, password);
    if (response.flag) {
      throw new ApiError(400, response.data);
    }

    return res.status(200).json(new ApiResponse(200, userData, response.data));
});

/**
 * @description : Generating Referesh Tokens
 * @param {Object} req : request for Refresh Token
 * @param {Object} res : response for Refresh Token
 * @return {Object} : response for Refresh Token {status, message, data}
 */

export const refreshToken = asyncHandler(async (req: Request, res: Response) => {
    const userData: userPayload = userPayloadFunction(req.user);

    if (!userData) {
        throw new ApiError(400, "Failed to turn user into userPayload");
    }

    // genrate new tokens
    const tokens: Tokens = generateTokens(userData, "ADMIN");

    // set tokens again in the cookies
    setAuthCookies(res, tokens.token, tokens.refreshToken);

    // Update Refresh token in the database
    const now = new Date();
    now.setDate(now.getDate() + 1);

    await UserTokens.update(
      {
        refreshToken: tokens?.refreshToken,
        refreshTokenExpiredTime: now,
        isRefreshTokenExpired: false,
        updatedBy: userData.id,
        updatedAt: new Date(),
      },
      {
        where: {
          userId: userData.id,
          isDeleted: false,
          isActive: true,
        },
      }
    );

    return res.status(200).json(new ApiResponse(200, userData, "New Tokens Generated Successfully..."));
});


export const getUserDetails = asyncHandler(async (req: Request, res: Response) => {
  const userData: userPayload = userPayloadFunction(req.user);
  if(!userData){
    throw new ApiError(404, "User not Found...");
  }

  return res.status(200).json(new ApiResponse(200, userData, "User Tokens Verififed Successfully..."));
})