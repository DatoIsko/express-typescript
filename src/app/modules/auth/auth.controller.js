'use strict';

import { ValidationError as ObjectionValidation } from 'objection';
import moment from 'moment';

import { CREATED_CODE, SUCCESS_CODE } from '../../configs/status-codes';
import * as jwt from 'jsonwebtoken';
import * as base64 from 'base-64';
import params from '../../configs/params';
import { ServiceUnavailable, AuthError, Gone, BadRequest, ValidationError } from '../../errors';
import {
    CREDENTIALS_NOT_MATCHING, INVALID_AUTHORIZATION_HEADER, INVALID_BASE64, INVALID_REFRESH_TOKEN,
    USER_NOT_EXIST, SOMETHING_WENT_WRONG, EXPIRED_LINK_TOKEN, IVALID_LINK_TOKEN, ACCOUNT_ACTIVATED
} from '../../configs/response-messages';

import File from '../../helpers/file';
import { ACTIVATION_REASON } from '../../configs/constants';
import { User, Token } from '../../../models';

export class AuthController {
    static async signIn(req, res, next) {
        const { email, password } = req.body;
        const authHeader = req.header('Authorization') || '';
        if (!authHeader.includes(' ')) {
            return next(new AuthError(INVALID_AUTHORIZATION_HEADER));
        }
        let baseToken = '';
        if (typeof authHeader === 'string') {
            baseToken = authHeader.split(' ')[1];
        }
        let  details = '';
        try {
            details = base64.decode(baseToken);
        } catch (err) {
            return next(new BadRequest(INVALID_BASE64, { message: err.message }));
        }
        if (!details.includes(':')) {
            return next(new AuthError(INVALID_AUTHORIZATION_HEADER));
        }
        const [headerEmail, headerPassword] = details.split(':');
        if (email !== headerEmail || password !== headerPassword) {
            return next(new AuthError(CREDENTIALS_NOT_MATCHING));
        }

        let user;
        try {
            user = await User.query().where('email', email).first();
        } catch (err) {
            return next(new BadRequest(USER_NOT_EXIST));
        }

        if (!user || !(user instanceof User) || !user.validatePassword(password)) {
            return next(new BadRequest(USER_NOT_EXIST));
        }

        const payload = { id: user.id, created_at: moment().toString() };
        const token = jwt.sign(payload, params.tokenSecret, { expiresIn: 15 * 60 }); // 15 minutes
        const refreshToken = jwt.sign({ ...payload }, params.refreshSecret, { expiresIn: 24 * 60 * 60 }); // an hour

        res.cookie('refreshToken', refreshToken, { path: '/', httpOnly: true });

        return res.status(SUCCESS_CODE).json({
            access_token: token,
            refresh_token: refreshToken,
            user: {
                id: user.id,
                name: user.name,
                email: user.email
            }
        });
    }

    static async signUp(req, res, next) {
        const userDetails = {
            name: req.body.name,
            email: req.body.email,
            password: req.body.password
        };

        let user;

        try {
            user = await User.query().insertAndFetch(userDetails);
        } catch (err) {
            if (err instanceof ObjectionValidation) {
                return next(new ValidationError(err.message));
            }
            
            return next(new ServiceUnavailable({ message: err.message }));
        }
        if (!user || !(user instanceof User)) {
            return next(new BadRequest(SOMETHING_WENT_WRONG));
        }

        return res.status(CREATED_CODE).json({
            name: user.name,
            email: user.email
        });
    }

    static async confirmEmail(req, res, next) {
        const { token } = req.params;

        let userToken;

        try {
            userToken = await Token.query()
                .eager('user')
                .where('token', token)
                .andWhere('reason', ACTIVATION_REASON)
                .first();
        } catch (error) {
            return next(new ServiceUnavailable(error.message));
        }

        if (!userToken || !(userToken instanceof Token) || !userToken.user) {
            return next(new BadRequest(IVALID_LINK_TOKEN));
        }

        if (moment(userToken.expiration, 'YYYY-MM-DD HH:mm:ss').isBefore(moment().format('YYYY-MM-DD HH:mm:ss'))) {
            return next(new Gone(EXPIRED_LINK_TOKEN));
        }

        let user;

        try {
            await Token.query().deleteById(userToken.id);
        } catch (error) {
            return next(new ServiceUnavailable({ message: error.message }));
        }

        return res.status(SUCCESS_CODE).json({
            message: ACCOUNT_ACTIVATED,
            data: null,
            errors: null
        });
    }

    static async refreshToken(req, res, next) {
        const { refreshToken } = req.cookies;
        const token = req.header('authorization') || '';

        let decoded;
        let data;

        try {
            decoded = jwt.verify(refreshToken, params.refreshSecret);
        } catch (err) {
            res.clearCookie('refresh_token');

            return next(new BadRequest(INVALID_REFRESH_TOKEN, err.message));
        }

        let user = undefined;

        if (!decoded.id) {
            res.clearCookie('refresh_token');

            return next(new BadRequest(INVALID_REFRESH_TOKEN));
        } else {
            user = await User.query().findById(decoded.id);
        }

        if (!user || !(user instanceof User)) {
            res.clearCookie('refresh_token');

            return next(new BadRequest(USER_NOT_EXIST));
        }

        if (token) {
            const file = new File(params.blackListFile, 'a+');
            try {
                await file.open();
                data = await file.read();
            } catch (err) {
                return next(new ServiceUnavailable(err.message));
            }

            if (data) {
                data = `${data}\n${token} - ${moment().format('YYYY-MM-DD HH:mm:ss')}`;
            } else {
                data = `${token} - ${moment().format('YYYY-MM-DD HH:mm:ss')}`;
            }

            try {
                await file.replaceContent(data);
            } catch (err) {
                return next(new ServiceUnavailable(err.message));
            }
        }

        const accessToken = jwt.sign({
            id: decoded.id,
            created_at: moment().toString()
        }, params.tokenSecret, { expiresIn: 15 * 60 });

        return res.status(SUCCESS_CODE).json({
            access_token: accessToken,
            user: {
                id: user.id,
                name: user.name,
                email: user.email
            }
        });
    }
}
