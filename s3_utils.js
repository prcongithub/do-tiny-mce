var path = require('path');
var logger = require('logger');

const http  = require('http'),
    https = require('https'),
    aws4  = require('aws4'),
    fs    = require('fs');

//var doCredentials = JSON.parse(fs.readFileSync(__dirname+'/config/do/credentials.json', "utf8"));

const { accessKeyId, secretAccessKey, regionName, bucketName, serviceName } = {
  accessKeyId: process.env.ACCESS_KEY_ID,
  secretAccessKey: process.env.SECRET_ACCESS_KEY,
  regionName: process.env.REGION_NAME,
  bucketName: process.env.BUCKET_NAME,
  serviceName: process.env.SERVICE_NAME
};

const spacesConfig = {
  accessKeyId: accessKeyId,
  secretAccessKey: secretAccessKey
};

const host = bucketName+'.'+regionName+'.digitaloceanspaces.com';

module.exports.uploadFile = function(request, callback){
  var file = request.file;
  //console.log(file);
  var file_path = file.path;
  var file_name = file.originalname.replace(/\s/,'');
  var key = "uploads/"+file_name;
  
  var body = fs.readFileSync(file_path);
  //var stat = fs.statSync(file_path);
  var opts = aws4.sign({
    host: host,
    method: 'PUT',
    path: '/'+key,
    region: regionName,
    service: serviceName,
    headers: {
      'Content-Length': Buffer.byteLength(body),
      'Content-Type': file.mimetype,
      'x-amz-acl': 'public-read'
    },
    body: body
  },spacesConfig);
  //console.log(opts);
  var s3Req = https.request(opts, function(api_res){
    var data = "";
    //console.log("Status: "+api_res.statusCode);
    api_res.on('data', function (chunk) {
      data += chunk;
    });
    api_res.on('error', function (err) {
      callback(err,null);
    });
    api_res.on('end', function (chunk) {
      //console.log(data);
      callback(null,{
        url: "https://"+host+"/"+key
      });
    });
  });
  s3Req.write(body);
  s3Req.end();
}
