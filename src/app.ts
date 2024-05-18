import express from 'express'
import * as dotenv from 'dotenv';
dotenv.config();
import { router } from './routes';
import cookieParser from 'cookie-parser';
import passport from 'passport';
import { adminPassportStrategy } from './config/passportAdminStrategy';

import sequelize from './database/dbConnection'; // Import the Sequelize instance


const app = express();
const PORT = process.env.PORT;

adminPassportStrategy(passport);

app.use(express.json());
app.use(express.urlencoded({extended: false}))
app.use(cookieParser())

sequelize.sync({force: false}).then(() => {
    console.log('connected to the database');
}).catch((error) => {
    console.log(error);
}).finally(() => {
    app.use(router);

    app.listen(PORT, () => {
        console.log('server started on port '+ PORT);
    })
})
