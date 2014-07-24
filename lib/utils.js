var utils = {};

// Returns the User's Home directory irrespective of operating system. Untested on Windows.
utils.getUserHome = function() { 
  console.log(process.env['USERPROFILE'])
  return process.env[(process.platform === 'win32') ? 'USERPROFILE' : 'HOME'];
};

module.exports = utils;
