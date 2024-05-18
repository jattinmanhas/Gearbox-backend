import { Sequelize } from "sequelize";
import config from './db';

const sequelize = new Sequelize(config.DB, config.USER, config.PASSWORD , {
    host : config.HOST,
    dialect : config.dialect,
    port : config.port,
    logging: console.log
})

export default sequelize;