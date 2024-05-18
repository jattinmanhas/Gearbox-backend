export interface DatabaseConfig {
  HOST: string;
  USER: string;
  PASSWORD: string;
  DB: string;
  dialect: "postgres";
  port: number;
}

export interface UserAttributes {
  id: number;
  username: string;
  password: string;
  email: string;
  name?: string; // Optional name field
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  addedBy?: number; // optional addedby field
  updatedBy?: number; // optional updated by field
  mobileNo?: string; // optional mobile no field
  isDeleted: boolean;
  [key: string]: unknown; // Add an index signature
}

export interface UserAuthSettingsAttributes {
  id: number;
  userId: number;
  loginOTP?: string;
  expiredTimeOfLoginOTP?: Date;
  resetPasswordCode?: string;
  expiredTimeOfResetPasswordCode?: Date;
  loginRetryLimit?: number;
  loginReactiveTime?: Date;
  isActive: boolean;
  addedBy: number;
  updatedBy?: number;
  createdAt: Date;
  updatedAt?: Date;
  isDeleted: boolean;
  [key: string]: unknown; // Add an index signature
}

export interface UserTokenAttributes {
  id: number;
  userId: number;
  token?: string;
  tokenExpiredTime?: Date;
  isTokenExpired?: boolean;
  refreshToken?: string;
  refreshTokenExpiredTime?: Date;
  isRefreshTokenExpired?: boolean;
  isActive: boolean;
  addedBy?: number;
  updatedBy?: number;
  createdAt: Date;
  updatedAt: Date;
  isDeleted: boolean;
  [key: string]: unknown;
}
