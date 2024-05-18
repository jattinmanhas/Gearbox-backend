/**
 * user.js
 * @description :: sequelize model of database table user
 */
import { Model, Optional, DataTypes } from "sequelize";
import sequelize from "../database/dbConnection";
import * as bcrypt from "bcrypt";
import { UserAuthSettings } from "./userAuthSettings";
import { UserAttributes } from "../types/dbtypes";


// By extending Optional<UserAttributes, 'id'>, the UserCreationAttributes interface inherits all the properties from UserAttributes but makes the id property optional as id is auto-generated by the database...
interface UserCreationAttributes extends Optional<UserAttributes, "id"> {}

export class User extends Model<UserAttributes, UserCreationAttributes> {
  public id!: number;
  public username!: string;
  public password! : string;
  public email!: string;
  public name!: string;
  public isActive!: boolean;
  public createdAt!: Date;
  public updatedAt!: Date;
  public addedBy!: number;
  public updatedBy!: number;
  public mobileNo!: string;
  public isDeleted!: boolean;

  public toJSON(): object {
    const {password, ...values} = this.get();
    return values;
  }

  public isPasswordMatch = async function (this : User, password: string){
    return bcrypt.compare(password, this.password);
  }

}

User.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    username: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    name: {
      type: DataTypes.STRING,
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true, // Set a default value for isActive
    },
    createdAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW, // Use NOW function for automatic timestamps
    },
    updatedAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
    addedBy: {
      type: DataTypes.INTEGER,
    },
    updatedBy: {
      type: DataTypes.INTEGER,
    },
    mobileNo: {
      type: DataTypes.STRING,
    },
    isDeleted: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false, // Set a default value for isDeleted
    },
  },
  {
    sequelize,
    modelName: "user", 
    timestamps: false,
    hooks : {
        beforeCreate : async(user : User, options: any) => {
            if(user.password){
                user.password = await bcrypt.hash(user.password, 12);
            }
            user.isActive = true;
            user.isDeleted = false;
        },
        afterCreate : async(user: User, options : any) => {
            try{
              const userAuthSettingsData = {
                userId: user.id,
              }
              await UserAuthSettings.create(userAuthSettingsData);
              console.log('User and userAuthSettings entries created successfully.');
            }catch(error){
              console.error('Error creating userAuthSettings entry:', error);
            }
        }
    }
  }
);