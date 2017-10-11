const params = {
    development: {
        apiUrl: 'http://localhost:3001/api',
        apiPort: 3001,
        appUrl: 'http://localhost:3000',
        tokenSecret: 'tokenSecret',
        refreshSecret: 'refreshSecret',
        logFile: 'storage/devLog.txt',
        blackListFile: 'storage/devTokenBlackList.txt'

    },
    production: {
        apiUrl: 'http://localhost:3001/api',
        apiPort: 3001,
        appUrl: 'http://localhost:3000',
        tokenSecret: 'tokenSecret',
        refreshSecret: 'refreshSecret',
        logFile: 'storage/prodLog.txt',
        blackListFile: 'storage/prodTokenBlackList.txt'
    },
    test: {
        apiUrl: 'http://localhost:3001/api',
        apiPort: 3001,
        appUrl: 'http://localhost:3000',
        tokenSecret: 'tokenSecret',
        refreshSecret: 'refreshSecret',
        logFile: 'storage/prodLog.txt',
        blackListFile: 'storage/prodTokenBlackList.txt'
    }
};

export default params[process.env.NODE_ENV || 'development'];
