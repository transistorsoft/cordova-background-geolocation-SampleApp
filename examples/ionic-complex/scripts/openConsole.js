const companyToken = require('../src/consoleConfig').companyToken;
const opn = require('opn');
opn('http://tracker.transistorsoft.com#' + companyToken);
process.exit();
