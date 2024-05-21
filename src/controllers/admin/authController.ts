import { Request, Response } from "express";
import { User } from "../../models/user";
import sequelize from "../../database/dbConnection";
import { checkUsernameorEmailExists, userPayloadFunction } from "../../utils/common";
import { generateTokens, loginUser, setAuthCookies } from "../../services/auth";
import { UserTokens } from "../../models/userTokens";
import { Tokens, UserAttributes, userDataReturn, userPayload } from "../../types/dbtypes";
/**
 * @description : login with username and password
 * @param {Object} req : request for login
 * @param {Object} res : response for login
 * @return {Object} : response for login {status, message, data}
 */

export const login = async (req: Request, res: Response) => {
  try {
    const { username, email, password } = req.body;

    if (username && email) {
      return res
        .status(400)
        .json({ error: "Provide either username or email, not both." });
    }

    if (!username && !email) {
      return res
        .status(400)
        .json({ error: "Provide either username or email." });
    }

    let login;

    if(username){
      login = await loginUser(username, password, 'ADMIN');
    }else{
      login = await loginUser(username, password, 'ADMIN');
    }

    if(login?.flag){
      return res.status(400).json({message: login.data})
    }

    const loginData = login?.data as userDataReturn;
    const token = loginData.token;
    const refreshToken = loginData.refreshToken;

    setAuthCookies(res, token, refreshToken);

    return res.status(200).json({ data: login?.data, message: "Login Successful"});

  } catch (error) {
    return res.status(500).json({ status: 500, message: error });
  }
};

/**
 * @description : user registration
 * @param {Object} req : request for register
 * @param {Object} res : response for register
 * @return {Object} : response for register {status, message, data}
 */

export const register = async (req: Request, res: Response) => {
  let transaction;

  try {
    transaction = await sequelize.transaction();

    let { username, password, email, name, mobileNo } = req.body;

    let usernameExists = await checkUsernameorEmailExists(username, "username");
    if (usernameExists) {
      if (transaction) await transaction.rollback();
      return res.status(400).json({ status: 400, message: "Username Already exists..." });
    }

    let emailExists = await checkUsernameorEmailExists(email, "email");
    if (emailExists) {
      if (transaction) await transaction.rollback();
      res.status(400).json({ status: 200, message: "Email already exists..." });
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
        return res.status(200).json({
          status: 200,
          message: "New user created successfully...",
          user: req.body,
        });
      }
    }

    if (transaction) await transaction.rollback();
    return res.status(400).json({
      status: 400,
      message: "Failed to create User...",
      user: req.body,
    });
  } catch (error) {
    if (transaction) await transaction.rollback();
    return res.status(500).json({ status: 500, message: error });
  }
};

/**
 * @description : logout user
 * @param {Object} req : request for logout
 * @param {Object} res : response for logout
 * @return {Object} : response for logout {status, message, data}
 */


export const logout = async(req: Request, res : Response) => {
  try{
      const user = req.user as UserAttributes;
      const userId  = user.id;
 
    let existingToken = await UserTokens.findOne({
      where: {
        userId: userId
      }
    })

    if(existingToken){
      await UserTokens.update({
        refreshToken: '',
        refreshTokenExpiredTime : new Date(),
        isRefreshTokenExpired: true,
        updatedBy : userId,
      }, {
        where: {
          userId: userId
        }
      })
    }

    return res.status(200).json({message: "Sucessfully Logged out"});

  }
  catch(error){
    console.log(error);
  }
}


export const forgotPassword = (req: Request, res: Response) => {
  console.log(req.user);

  const tokenCookie = req.cookies.token;
  console.log(tokenCookie);
}

export const refreshToken = async (req: Request, res : Response) => {
  try{
    const userData : userPayload = userPayloadFunction(req.user);

    if(!userData){
      return res.status(200).json({message: "Failed to turn user into userPayload"});
    }
  
    // genrate new tokens
    const tokens : Tokens = generateTokens(userData, "ADMIN");
  
    // set tokens again in the cookies
    setAuthCookies(res, tokens.token, tokens.refreshToken);
  
    // Update Refresh token in the database
    const now = new Date();
    now.setDate(now.getDate() + 1);
  
    await UserTokens.update({
      refreshToken: tokens?.refreshToken,
      refreshTokenExpiredTime : now,
      isRefreshTokenExpired: false,
      updatedBy: userData.id,
      updatedAt: new Date()
    }, {
      where: {
        userId: userData.id
      }
    })
    
    return res.status(200).json({message: "New tokens generated Successfully..."})
  
  }catch(error){
    res.status(500).json({message: "Server error"});
  }

}