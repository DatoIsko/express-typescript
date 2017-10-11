'use strict';

import http from 'http';
import params from './app/configs/params';
import App from './app/app';

const server = http.createServer(App());

server.listen(params.apiPort, () => {
    console.log(`Listening ${server.address().port} port.`);
});
