var express = require('express');
const router = express.Router({
  mergeParams: true
});

const s3Utils = require('../s3_utils');
const fs = require('fs');
const path = require('path');
var upload = require("../initmulter").upload;


/* GET users listing. */
router.get('/', function(req, res, next) {
  res.render('files/index');
});

router.put('/upload',  upload.single('file'), postFile);

async function postFile(request, response) {
  //response.send({success: true});
  s3Utils.uploadFile(
    request, 
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
