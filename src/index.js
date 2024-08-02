const express = require('express');
const authRoute = require('./routes/authRoutes')
// const morgan = require("morgan"); // HTTP request logger middleware for node.js
// const rateLimit = require("express-rate-limit"); 
// const helmet = require("helmet"); 
// const mongosanitize = require("express-mongo-sanitize"); 

// const xss = require("xss-clean"); 
const bodyParser = require("body-parser"); 
const cors = require("cors"); 
const cookieParser = require("cookie-parser"); 
// const session = require("cookie-session"); 

const jwt = require("jsonwebtoken");


const app = express();

app.use(
    cors({
      origin: "*",
  
      methods: ["GET", "PATCH", "POST", "DELETE", "PUT"],
  
      credentials: true, //
  
      //   Access-Control-Allow-Credentials is a header that, when set to true , tells browsers to expose the response to the frontend JavaScript code. The credentials consist of cookies, authorization headers, and TLS client certificates.
    })
  );

  app.use(bodyParser.json()); // Returns middleware that only parses json
  app.use(bodyParser.urlencoded({ extended: true })); // Returns middleware that only parses urlencoded bodies
  app.use(cookieParser({
    credentials: true,
    origin: "http://localhost:4000"
  }));



app.use('/auth', authRoute);



app.listen(3000, ()=> {
    console.log("app is is listening on port 3000")
})