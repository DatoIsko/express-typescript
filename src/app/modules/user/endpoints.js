'use strict';

import { UserController } from './user.controller';
import middlewares from '../../middlewares';
import schemas from './schemas';

export default (router) => {
    const {getUser} = UserController;

    router.get('/me', ...middlewares(schemas, 'getUser'), getUser);
};
