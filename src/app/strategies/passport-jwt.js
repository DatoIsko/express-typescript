'use strict';

import { User } from '../../models';
import { USER_NOT_EXIST } from '../configs/response-messages';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { AuthError } from '../errors';
import { ServiceUnavailable } from '../errors';

export default (secret, passport) => {
    passport.serializeUser((user, done) => {
        done(null, user.id);
    });
    passport.deserializeUser((id, done) => {
        User.query().findById(id).first()
            .then((user) => {
                user ? done(null, user) : done(new AuthError(USER_NOT_EXIST), null);
            })
            .catch((err) => {
                done(err, null);
            });
    });

    let jwtOptions = {
        jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
        secretOrKey: secret
    };

    let strategy = new Strategy (jwtOptions, (payload, next) => {
        User.query().findById(payload.id).first()
            .then((user) => {
                if (user) {
                    next(null, user);
                } else {
                    next(new AuthError(USER_NOT_EXIST), false);
                }

                return null;
            }).catch((err) => {
                next(new ServiceUnavailable({ message: err.message }), false);
            });
    });
    passport.use(strategy);
};
