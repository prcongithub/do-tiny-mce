var multer  = require('multer');
var path = require('path');
var appDir = path.dirname(require.main.filename);
var destination = appDir+"/public/uploads/";
var upload = multer({ dest: destination })
module.exports.upload = upload;
