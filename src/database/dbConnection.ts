import { Sequelize } from "sequelize";
import config from './db';

const sequelize = new Sequelize(config.DB, config.USER, config.PASSWORD , {
    host : config.HOST,
    dialect : config.dialect,
    port : config.port,
    logging: console.log,
    // dialectOptions: {
    //     ssl: {
    //       require: true, // This will help you. But you will see nwe error
    //       rejectUnauthorized: false // This line will fix new error
    //     }
    //   },    
})

export default sequelize;