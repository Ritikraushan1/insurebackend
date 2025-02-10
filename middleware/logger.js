const fs = require('fs');
const path = require('path');

const logFilePath = path.join(__dirname, '../data/logs.txt');

const logger = (req, res, next) => {
    const startTime = Date.now();

    const originalEnd = res.end;

    res.end = function (...args) {
        const endTime = Date.now();
        const responseTime = endTime - startTime;

        const logDetails = `
[${new Date().toISOString()}]
Method: ${req.method}
URL: ${req.originalUrl}
Status: ${res.statusCode}
Response Time: ${responseTime}ms
------------------------------
`;

        fs.appendFile(logFilePath, logDetails, (err) => {
            if (err) {
                console.error('Error writing to log file:', err);
            }
        });

        originalEnd.apply(res, args);
    };

    next(); 
};

module.exports = logger;
