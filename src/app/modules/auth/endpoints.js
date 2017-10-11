'use strict';

import { AuthController } from './auth.controller.js';
import middlewares from '../../middlewares'
import schemas from './schemas';

export default (router) => {
    const {signIn, signUp} = AuthController;

    router.post('/sign-in', ...middlewares(schemas, 'signIn'), signIn);
    router.post('/sign-up', ...middlewares(schemas, 'signUp'), signUp);
}