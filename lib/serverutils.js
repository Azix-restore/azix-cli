var serverUtils = {};

serverUtils.serverURL = 'localhost';
serverUtils.serverPORT = 8000;
serverUtils.serverAPIINIT = '/api/init';

serverUtils.chunk = function (res) {
  var resBody;
  res.on('data', function (chunk) {
    resBody += chunk;
  });
  return resBody;
};


module.exports = serverUtils;
