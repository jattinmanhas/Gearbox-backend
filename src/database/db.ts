import { DatabaseConfig } from "../types/dbtypes";

/**
 * db.js
 * @description :: exports values used to make connection with SQL database
 */

const isTestEnv = process.env.NODE_ENV === 'test';

const config: DatabaseConfig = {
    HOST: process.env.HOST || '',
    USER: process.env.DATABASE_USERNAME  || '',
    PASSWORD: process.env.DATABASE_PASSWORD  || '',
    DB: process.env.DATABASE_NAME  || '',
    dialect: 'postgres',
    port: Number(process.env.DB_PORT)  || 5432,
}

if(isTestEnv){
    config.HOST = process.env.TEST_HOST || '';
    config.USER = process.env.TEST_DATABASE_USERNAME || '';
    config.PASSWORD = process.env.TEST_DATABASE_PASSWORD || '';
    config.DB = process.env.TEST_DATABASE_NAME || '';
    config.port = Number(process.env.TEST_DB_PORT) || 5432;  
}

export default config;