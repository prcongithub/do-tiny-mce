var express = require('express');
const router = express.Router({
  mergeParams: true
});

const s3Utils = require('do-assets/s3_utils');
const fs = require('fs');
const path = require('path');
var upload = require("../initmulter").upload;


/* GET users listing. */
router.get('/', function(req, res, next) {
  s3Utils.listBuckets(function(error, data){
    res.render('files/index',{
      error: error,
      data: data
    });
  })
});

router.put('/upload',  upload.single('file'), postFile);

async function postFile(request, response) {
  //response.send({success: true});
  s3Utils.uploadFile(
    request.file, 
    "uploads",
    function(error, attachment){
      try {
        fs.unlink(request.file.path,function(e){
          console.log("Deleted Uploaded File: "+request.file.path);
        });
      } catch(e) {
        console.log("Error: "+e.message);
      }
      if(error) {
        response.send({
          success: false,
          error: error,
          data: request.params
        });
        return;
      }
      response.send({
        success: true,
        attachment: attachment,
        data: request.params
      });
    }
  );
}

module.exports = router;
