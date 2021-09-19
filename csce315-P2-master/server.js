const express = require ('express');
const path = require ('path');
const mysql = require('mysql');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var session = require('express-session');
const auth = require('./core/auth')
var routes = require('./routes/route');
var pool = require('./core/db');
const passport = require('passport');
const app = express();
const FileStore = require('session-file-store')(session); 

var PORT = process.env.PORT || 3000;



app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.set('trust proxy', 1) // trust first proxy
app.use(session({
  store: new FileStore,
  resave: false,
  key: 'app.sess',
  secret: 'SEKR37',
  saveUninitialized: true,
  cookie: { 
    secure: false,
    maxAge:864000000
   }
}));
app.use(passport.initialize())
app.use(passport.session()) // persistent login sessions




app.use(express.static(path.join(__dirname,"public")));
app.use('/', routes);
//app.use('/extern',  yelp); // redirect bootstrap JS
app.use('/js', express.static(__dirname + '/node_modules/bootstrap/dist/js')); // redirect bootstrap JS
app.use('/js', express.static(__dirname + '/node_modules/jquery/dist')); // redirect JS jQuery
app.use('/css', express.static(__dirname + '/node_modules/bootstrap/dist/css')); // redirect CSS bootstrap
app.use('/font', express.static(__dirname + '/node_modules/@fortawesome/fontawesome-free/js'));//redirect to font awesome

/**
 * CREATE TABLE USERS(authID DECIMAL(38,0) NOT NULL, authMethod VARCHAR(50) NOT NULL, lastLOGIN TIMESTAMP NULL ON UPDATE current_timestamp,createdOn TIMESTAMP NOT NULL, calorieBudget INTEGER, moneyBudget INTEGER)
 * CREATE TABLE FAVORITES(authID DECIMAL(38,0) NOT NULL,itemId VARCHAR(30) NOT NULL,API VARCHAR(3) NOT NULL,STATUS BOOLEAN);
 * CREATE TABLE MEAL (authID DECIMAL(38,0) NOT NULL,day VARCHAR(2) NOT NULL,timeOfDay VARCHAR(2) NOT NULL,calories DECIMAL, price DECIMAL,mealId VARCHAR(30),API VARCHAR(3));
 */
var sql = "SELECT * from users";
pool.query(sql, function (err, result) {
  if (err) return console.error(err.message);
  // console.log(result);
});
//yelp.search('Four Barrel Coffee','san francisco, ca');
app.get('/',function(req,res){
    res
      .status(200)
      .sendFile(path.join(__dirname,'/index.html'));
    
});
// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Page Not Found');
  err.status = 404;
  next(err);
});
// Handling errors (send them to the client)
app.use((err, req, res, next) => {
  res.status(err.status || 500);
  res.send(err.message);
});

app.listen(PORT,function(){console.log('server successfully started on port '+PORT);});

module.exports = app;