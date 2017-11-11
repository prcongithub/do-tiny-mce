//= require sha256
//= require hmac-sha256
//= require aws-sign-web
//= require tinymce/tinymce.min
//= require tinymce-aws-s3-upload-plugin.min
//= require signature
/*
var spacesConfig = {
  // AWS Region (default: 'eu-west-1')
  region: 'ams3',
  // AWS service that is called (default: 'execute-api' -- AWS API Gateway)
  service: 's3',
  accessKeyId: '',
  secretAccessKey: '',
  endPoint: '',
  folderName: 'uploads',   // optional
  bucketName: 'prc'
};
*/

tinymce.init({
  selector: '#tinyMCEContainer',
  height: 500,
  menubar: false,
  // Plugin configuration
  plugins: 'AwsS3Upload',
  toolbar: 'bold italic underline | bullist numlist outdent indent | AwsS3UploadButton',
  Awss3UploadSettings: {
    buttonText: 'File Upload',  // optional
    // awsAuth: spacesConfig,
    progress: {
      bar:true,                    // optional default=true
      callback: progress => {      // optional
        console.log(progress)
      },
      errorCallback: err => {      // optional
        console.log(err)
      },
      successCallback:(editor,url) => {  // optional
        // For example
        switch(url.split('.').pop()){
          case 'png':
          case 'jpg':
          case 'jpeg':{
            editor.execCommand('mceInsertContent', false, `<img src="${url}" style="display: block;margin: 0 auto;text-align: center; max-width:100%;" />`);
            break;
          }
          default:{
            editor.execCommand('mceInsertContent', false, `<a href="${url}">${url}</a>`);
          }
        }
      }
    },
    secondFileSelectedBeforeFirstUpload:{ // optional
      callback:()=>{
        alert('You cannot upload because first upload is progressing');
      }
    }
  }
});
