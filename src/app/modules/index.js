'use strict';

import { AuthModule } from './auth/index';
import { UserModule } from './user/index';

export default (router) => {

    const auth = new AuthModule(router);
    const user = new UserModule(router);
    const modules = [
        auth,
        user
    ];

    modules.forEach((module) => module.createEndpoints());
}
