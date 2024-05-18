/**
 * userTokens.js
 * @description :: sequelize model of database table userTokens
 */

import { DataTypes, Model, Optional } from "sequelize";
import sequelize from "../database/dbConnection";
import { UserTokenAttributes } from "../types/dbtypes";

interface UserCreationTokenAttributes
  extends Optional<UserTokenAttributes, "id"> {}

export class UserTokens extends Model<
  UserTokenAttributes,
  UserCreationTokenAttributes
> {
  declare id: number;
  declare userId: number;
  declare token?: string;
  declare tokenExpiredTime?: Date;
  declare isTokenExpired?: boolean;
  declare refreshToken?: string;
  declare refreshTokenExpiredTime?: Date;
  declare isRefreshTokenExpired?: boolean;
  declare isActive: boolean;
  declare addedBy?: number;
  declare updatedBy?: number;
  declare createdAt: Date;
  declare updatedAt: Date;
  declare isDeleted: boolean;

  public toJSON(): object {
    let values = Object.assign({}, this.get());
    return values;
  }
}

UserTokens.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    userId: {
      type: DataTypes.INTEGER,
      references: {
        model: "users",
        key: "id",
      },
    },
    refreshToken: { type: DataTypes.STRING },
    refreshTokenExpiredTime: { type: DataTypes.DATE },
    isRefreshTokenExpired: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    isActive:{ type:DataTypes.BOOLEAN },
    addedBy:{ type:DataTypes.INTEGER },
    updatedBy:{ type:DataTypes.INTEGER },
    createdAt:{ type:DataTypes.DATE },
    updatedAt:{ type:DataTypes.DATE },
    isDeleted:{ type:DataTypes.BOOLEAN }  
  },
  {
    sequelize,
    modelName: "userTokens",
    timestamps: false,
    hooks : {
        beforeCreate : async function(userTokens: UserTokens, options: any){
            userTokens.isActive = true;
            userTokens.isDeleted = false;
        }
    }
  }
);
