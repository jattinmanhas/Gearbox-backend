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

const corsOptions = {
    origin: 'http://localhost:3000', // Replace with your frontend URL
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
    optionsSuccessStatus: 204
  };
  
  app.use(cors(corsOptions));



adminPassportStrategy(passport);
adminRefreshTokenStrategy(passport);

app.use(express.json());
app.use(express.urlencoded({extended: false}))
app.use(cookieParser())

sequelize.sync({force: false}).then(() => {
    console.log('connected to the database');
}).catch((error) => {
    throw new ApiError(500, "Could not connect to the Database...")
}).finally(() => {
    // All routes...
    app.use(router);

    // Error handling middleware...
    app.use(errorHandlerMiddleware);

    app.listen(PORT, () => {
        console.log('server started on port '+ PORT);
    })
})
