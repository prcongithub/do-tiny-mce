function getSignedRequestHeaders(options) {
  // Create a new signer
  var signer = new awsSignWeb.AwsSigner(options.spacesConfig);
  // Sign a request
  var request = {
    method: options.method,
    url: options.url,
    headers: {
      accept: 'application/json'
    }
  };
  var signed = signer.sign(request);
  return signed;
}

function uploadCORS(file,config) {
  let extension = file.name.split('.').pop(),
  fileName = file.name.split('.' + extension)[0],
  objKey = (config.folderName ? `${config.folderName}/` : '') + fileName + '-' + Date.now() + '.' + extension;
  
  var url = "https://"+config.bucketName+"."+config.region+"."+"digitaloceanspaces.com/?cors";
  
  var reqOptions = {
    url: url,
    method: 'PUT',
    spacesConfig: config
  }
  
  var headers = getSignedRequestHeaders(reqOptions);
  console.log(headers);
  
  ajaxRequest({
    uri: url,
    method: 'put',
    data: file,
    headers: headers,
    successCallback: function(xhr) {
      console.log("Success");
      console.log(xhr);
    },
    errorCallback: function(xhr) {
      console.log("Error");
      console.log(xhr);
    }
  });
}  

function uploadFile(file,config) {
  let extension = file.name.split('.').pop(),
  fileName = file.name.split('.' + extension)[0],
  objKey = (config.folderName ? `${config.folderName}/` : '') + fileName + '-' + Date.now() + '.' + extension;
  
  var url = "https://"+config.bucketName+"."+config.region+"."+"digitaloceanspaces.com/"+objKey;
  var reqOptions = {
    url: url,
    method: 'PUT',
    spacesConfig: config
  }
  
  var headers = getSignedRequestHeaders(reqOptions);
  headers['Content-Length'] = file.size;
  headers['Content-Type'] = file.type;

  console.log(headers);
  
  ajaxRequest({
    uri: url,
    method: 'put',
    data: file,
    headers: headers,
    successCallback: function(xhr) {
      console.log("Success");
      console.log(xhr);
    },
    errorCallback: function(xhr) {
      console.log("Error");
      console.log(xhr);
    }
  });
}

function uploadToServer(file,options) {
  var url = "/upload";
  var headers = {};
  headers['Content-Length'] = file.size;
  headers['Content-Type'] = file.type;
  
  var formData = new FormData();
  formData.append("file", file, file.name);
  ajaxRequest({
    uri: url,
    method: 'put',
    data: formData,
    headers: headers,
    successCallback: function(xhr) {
      console.log("Success");
      console.log(xhr);
      options.successCallback(xhr);
    },
    errorCallback: function(xhr) {
      console.log("Error");
      console.log(xhr);
      options.errorCallback(xhr);
    }
  });
}

function getBuckets(config) {
  var url = "https://"+config.bucketName+"."+config.region+"."+"digitaloceanspaces.com";
  
  var reqOptions = {
    url: url,
    method: 'GET',
    spacesConfig: config
  }
  
  var headers = getSignedRequestHeaders(reqOptions);
  console.log(headers);
  
  ajaxRequest({
    uri: url,
    method: 'get',
    headers: headers,
    successCallback: function(xhr) {
      console.log("Success");
      console.log(xhr);
    },
    errorCallback: function(xhr) {
      console.log("Error");
      console.log(xhr);
    }
  });
}  

function ajaxRequest(options) {
  function getXhr(options) {
    var xhr;
    if(typeof XMLHttpRequest !== 'undefined') {
      xhr = new XMLHttpRequest();
    } else {
      var versions = [
        "MSXML2.XmlHttp.5.0", 
        "MSXML2.XmlHttp.4.0",
        "MSXML2.XmlHttp.3.0", 
        "MSXML2.XmlHttp.2.0",
        "Microsoft.XmlHttp"
      ]
      for(var i = 0, len = versions.length; i < len; i++) {
        try {
          xhr = new ActiveXObject(versions[i]);
          break;
        }
        catch(e){}
      } // end for
    }
     
    xhr.onreadystatechange = function() {
      if(xhr.readyState < 4) {
        return;
      }
       
      if(xhr.status !== 200) {
        options.errorCallback(xhr);
        return;
      }
      // all is well  
      if(xhr.readyState === 4) {
        options.successCallback(xhr);
        return;
      }           
    };
    
    return xhr;
  }
  
  function put(options) {
    var xhr = getXhr(options);
    xhr.open("PUT", options.uri, true);
    //Send the proper header information along with the request
    for(header in Object.keys(options.headers)) {
      xhr.setRequestHeader(header, options.headers[header]);
    }
    //console.log(data);
    xhr.send(options.data);
  }
  
  function post(options) {
    var xhr = getXhr(options);
    xhr.open("POST", options.uri, true);
    //console.log(data);
    //Send the proper header information along with the request
    for(header in Object.keys(options.headers)) {
      xhr.setRequestHeader(header, options.headers[header]);
    }
    xhr.send(options.data);
  }
  
  function get(options) {
    var xhr = getXhr(options);
    xhr.open('GET', options.uri, true);
    //Send the proper header information along with the request
    for(header in Object.keys(options.headers)) {
      xhr.setRequestHeader(header, options.headers[header]);
    }
    xhr.send('');
  }
  
  eval(options.method)(options);
}
