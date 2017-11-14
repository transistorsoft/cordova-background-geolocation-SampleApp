const  fs = require('fs');
const consoleConfigPath = './src/consoleConfig.js';
if (!fs.existsSync(consoleConfigPath)) {
  const _ = require('lodash');
  const ip = require('ip');
  const ipAddress = ip.address();
  const ifaces = require('os').networkInterfaces();
  const macAddress = _.find(_.flatten(_.values(ifaces)), { address : ipAddress}).mac;
  const md5 = require('md5');
  const companyToken = md5(macAddress).substring(0, 8);
  const generatedContent = `
// generated automatically, but feel free to change
// and remove from a gitignore file
exports.defaultLocationUrl = 'http://tracker.transistorsoft.com/locations';
exports.companyToken = '${companyToken}';
  `;
  fs.writeFileSync(consoleConfigPath, generatedContent, 'utf-8');
}
