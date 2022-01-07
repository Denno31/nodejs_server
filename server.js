// Design a basic HTTP web-server application which can listen on a configurable TCP port and serve both static HTML
// and dynamically generated HTML by means of a chosen programming language, such as in the way Apache uses PHP.
// It is acceptable for this server application to support only a restricted subset of HTTP,
// such as GET or POST requests, and the only headers it must support are Content-Type and Content-Length

// Importing necessary modules
const http = require("http");
const url = require("url");
const fs = require("fs");
const path = require("path");

// Port on which the server will create
const PORT = 5000;

// Maps file extension to MIME types which
// helps browser to understand what to do
// with the file
const mimeType = {
  ".doc": "application/msword",
  ".eot": "application/vnd.ms-fontobject",
  ".ttf": "application/font-sfnt",
  ".ico": "image/x-icon",
  ".html": "text/html",
  ".js": "text/javascript",
  ".json": "application/json",
  ".css": "text/css",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".wav": "audio/wav",
  ".mp3": "audio/mpeg",
  ".svg": "image/svg+xml",
  ".pdf": "application/pdf",
};
const acceptableMethods = ["POST", "GET"];
// Creating a server and listening at port 5000
http
  .createServer((req, res) => {
    console.log(req.headers);
    //should only accept get and post requests
    if (acceptableMethods.indexOf(req.method) === -1)
      return res.end(
        "The method is not supported. Only GET and POST requests are accepted"
      );
    // Parsing the requested URL

    const parsedUrl = url.parse(req.url);

    // If requested url is "/" like "http://localhost:5000/"
    if (parsedUrl.pathname === "/") {
      var filesLink = "<ul>";
      res.setHeader("Content-type", "text/html");
      var filesList = fs.readdirSync("./");
      filesList.forEach((element) => {
        if (fs.statSync("./" + element).isFile()) {
          filesLink += `<br/><li><a href='./${element}'>
					${element}
				</a></li>`;
        }
      });

      filesLink += "</ul>";

      return res.end(
        "<h1>Welcome to DenoServer 3.0</h1><h2>List of files:</h2> " + filesLink
      );
    }

    /* Processing the requested file pathname to
	avoid directory traversal like,
	http://localhost:5000/../fileOutofContext.txt
	by limiting to the current directory only. */
    const sanitizePath = path
      .normalize(parsedUrl.pathname)
      .replace(/^(\.\.[\/\\])+/, "");

    let pathname = path.join(__dirname, sanitizePath);

    if (!fs.existsSync(pathname)) {
      // If the file is not found, return 404
      res.statusCode = 404;
      return res.end(`File ${pathname} not found!`);
    } else {
      // Read file from file system limit to
      // the current directory only.
      fs.readFile(pathname, function (err, data) {
        if (err) {
          res.statusCode = 500;
          return res.end(`Error in getting the file.`);
        } else {
          // Based on the URL path, extract the
          // file extension. Ex .js, .doc, ...

          const ext = path.parse(pathname).ext;

          // If the file is found, set Content-type
          // and send data
          res.setHeader("Content-type", mimeType[ext] || "text/plain");

          return res.end(data);
        }
      });
    }
  })
  .listen(PORT);

console.log(`Server listening on port ${PORT}`);
