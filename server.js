var https = require("https");
var express = require("express");
var fs = require("fs");
var path = require("path");

var server = express();

var opts = {
  "verification_code": "",
  "access_token": ""
}

server.get("/", (req, res) => {
  res.redirect("http://localhost:8080/site/index.html");
});

// Facebook login dialog
server.get("/login", (req, res) => {
  res.redirect("https://www.facebook.com/v2.8/dialog/oauth?client_id=657833254398999&client_secret=c6a0d29e584da084fe144e5303fbc488&redirect_uri=http://localhost:8080/login/success&scope=user_about_me,user_posts");
});

// login success page. Instantly redirects to the main page upon success
server.get("/login/success*", (req, res) => {
  if (req.query.code) {
    opts.verification_code = req.query.code;

    getAccessToken((token) => {
      opts.access_token = token;
      res.redirect("http://localhost:8080/");
    });
  } else {
    console.log("URL query string did not include verification code")
    res.send("URL query string did not include verification code");
  }
});

// Process API calls from client
server.get("/api*", (req, res) => {
  call = req.query.call;
  processApiCall(call, (apires) => {
    res.send(apires);
  });
});

// Serve site if logged in. If not, send a request to do so
server.get("/site*", (req, res) => {
  if (!opts.access_token) {
    res.send("<a href='http://localhost:8080/login'>Log in to Facebook</a>");
  } else {
    expressServeStatic(req, res, __dirname);
  }
});

server.listen(8080, () => {
  console.log("Server listening")
});

// Access token getter
function getAccessToken(callback) {
  if (typeof(callback) != "function") {
    throw new TypeError("callback is not a function");
  } else {
    https.get("https://graph.facebook.com/v2.8/oauth/access_token?client_id=657833254398999&client_secret=c6a0d29e584da084fe144e5303fbc488&redirect_uri=http://localhost:8080/login/success&code=" + opts.verification_code, (res) => {
      res.setEncoding("utf8");

      var buffer = "";
      res.on("data", (chunk) => {
        buffer += chunk;
      });

      res.on("end", () => {
        callback(JSON.parse(buffer).access_token);
      });
    });
  }
}

// API call processor
function processApiCall(call, callback) {
  if (typeof(callback) != "function") {
    throw new TypeError("callback is not a function");
  } else {
    https.get("https://graph.facebook.com/v2.8" + call + "?access_token=" + opts.access_token, (res) => {
      res.setEncoding("utf8");

      var buffer = "";
      res.on("data", (chunk) => {
        buffer += chunk;
      });

      res.on("end", () => {
        callback(JSON.parse(buffer));
      });
    });
  }
}

// Static file server for Express
function expressServeStatic(req, res, root) {
  if (!fs.statSync(root).isDirectory()) {
    throw new FileError("root directory is not a directory: " + root);
  } else {
    root = path.resolve(root);
    fname = path.normalize(root + req.path);

    var isfile = false;
    try {
      var isfile = fs.statSync(fname).isFile();
    } catch(err) {
      console.log("File " + fname + " is inaccessible")
    }

    if (isfile) {
      res.sendFile(fname);
    } else {
      res.send("this is a directory");
    }
  }
}
