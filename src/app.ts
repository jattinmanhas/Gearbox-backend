import express from 'express'
import * as dotenv from 'dotenv';
dotenv.config();
import { router } from './routes';
import cookieParser from 'cookie-parser';
import passport from 'passport';
import { adminPassportStrategy } from './config/passportAdminStrategy';
import { adminRefreshTokenStrategy } from './config/passportAdminRefreshTokenStrategy';

import cors from 'cors';

import sequelize from './database/dbConnection'; // Import the Sequelize instance
import { errorHandlerMiddleware } from './middlewares/errorHandlingMiddleware';
import { ApiError } from './utils/handlers/apiError';


const app = express();
const PORT = process.env.PORT;

app.use(cors({
    origin: 'http://localhost:3000/', // Update this to match your frontend origin
    credentials: true
}));

app.use(cookieParser())

// app.get('/shop', (req, res) => {
    // console.log('inside cookie');
    // res.cookie('token', 'someTokenValue', {
    //     httpOnly: true,
    //     secure: process.env.NODE_ENV === 'production' // Use secure cookies in production
    // });
    // res.status(200).send('Cookie set');
// });



adminPassportStrategy(passport);
adminRefreshTokenStrategy(passport);

app.use(express.json());
app.use(express.urlencoded({extended: false}))
app.use(router);


sequelize.sync({force: false}).then(() => {
    console.log('connected to the database');
}).catch((error) => {
    throw new ApiError(500, "Could not connect to the Database...")
}).finally(() => {
    // All routes...

    // Error handling middleware...
    app.use(errorHandlerMiddleware);

    app.listen(PORT, () => {
        console.log('server started on port '+ PORT);
    })
})
