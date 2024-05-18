/**
 * userAuthSettings.js
 * @description :: sequelize model of database table userAuthSettings
 */

import { DataTypes, Optional, Model } from "sequelize";
import sequelize from "../database/dbConnection";
import { UserAuthSettingsAttributes } from "../types/dbtypes";

interface UserCreationAuthSettingsAttributes
  extends Optional<UserAuthSettingsAttributes, "id"> {}

export class UserAuthSettings extends Model<
  UserAuthSettingsAttributes,
  UserCreationAuthSettingsAttributes
> {
  declare id: number;
  declare userId: number;
  declare loginOTP?: string;
  declare expiredTimeOfLoginOTP?: Date;
  declare resetPasswordCode?: string;
  declare expiredTimeOfResetPasswordCode?: Date;
  declare loginRetryLimit?: number;
  declare loginReactiveTime?: Date;
  declare isActive: boolean;
  declare addedBy: number;
  declare updatedBy?: number;
  declare createdAt: Date;
  declare updatedAt?: Date;
  declare isDeleted: boolean;

  public toJSON(): object {
    let values = Object.assign({}, this.get());
    return values;
  }
}

UserAuthSettings.init(
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
    loginOTP: DataTypes.STRING,
    expiredTimeOfLoginOTP: DataTypes.DATE,
    resetPasswordCode: DataTypes.STRING,
    expiredTimeOfResetPasswordCode: DataTypes.DATE,
    loginRetryLimit: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    loginReactiveTime: DataTypes.DATE,
    isActive: DataTypes.BOOLEAN,
    addedBy: DataTypes.INTEGER,
    updatedBy: DataTypes.INTEGER,
    createdAt: {
      type: DataTypes.DATE,
      allowNull: true,
      defaultValue: DataTypes.NOW, // Use NOW function for automatic timestamps
    },
    updatedAt: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
    isDeleted: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
  },
  {
    sequelize,
    modelName: "userAuthSettings",
    timestamps: false,
    hooks: {
      beforeCreate: async function (
        userAuthSettings: UserAuthSettings,
        options: any
      ) {
        userAuthSettings.isActive = true;
        userAuthSettings.isDeleted = false;
      },
    },
  }
);
