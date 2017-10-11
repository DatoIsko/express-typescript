import express from 'express';
import cors from 'cors';
import RateLimit from 'express-rate-limit';
import logger from 'morgan';
import passport from 'passport';
import helmet from 'helmet';
import Knex from 'knex';

import { json, urlencoded } from 'body-parser';
import { Model } from 'objection';

import enableModules from './modules';

import limiter from './configs/limiter';
import corsOptions from './configs/cors';
import params from './configs/params';
import configPassport from './strategies/passport-jwt';
import database from './configs/database';
import { BAD_REQUEST_CODE } from './configs/status-codes';
import cookieParser from 'cookie-parser';
import expressValidator from 'express-validator';
// const expressValidator = require('express-validator');
class Application {
    app;
    router;

    constructor () {
        this.app = express();
        this.initApp();
    }
    initApp() {
        this.configApp();
        this.configDb();
        this.configPassport();
        this.setParams();
        this.setRouter();
        this.setErrorHandler();
        this.enableModules();
    }

    configApp() {
        this.app.use(cors(corsOptions))
            .use(json())
            .use(expressValidator())
            .use(urlencoded({ extended: true }))
            .use(cookieParser())
            .use(this.createLimiter())
            .use(helmet());

        if (this.app.get('env') !== 'production') {
            this.app.use(logger('dev'));
        }
    }

    createLimiter() {
        return new RateLimit(limiter);
    }

    configDb() {
        Model.knex(Knex(database))
    }
    setParams() {
        this.app.set('json spaces', 4);
    }
    configPassport() {
        configPassport(params.tokenSecret, passport);
        this.app.use(passport.initialize())
            .use(passport.session())
    }
    setRouter() {
        this.router = express.Router();
        this.app.use(`/api`, this.router);
    }

    setErrorHandler() {
        this.app.use((err, req, res, next) => {
           return res.status (err.status || BAD_REQUEST_CODE).json({
               status: BAD_REQUEST_CODE,
               data: null,
               message: err.message || '',
               errors: err.errors || null
           })
        });
    }

    enableModules() {
        enableModules(this.router);
    }
}

export default () => new Application().app;
