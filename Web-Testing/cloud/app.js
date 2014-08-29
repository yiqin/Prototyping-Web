var express = require('express');
var parseExpressHttpsRedirect = require('parse-express-https-redirect');
var parseExpressCookieSession = require('parse-express-cookie-session');
var app = express();

var path = require('path')

app.use(express.static(path.join(__dirname, 'public')));


app.set('views', 'cloud');
app.set('view engine', 'ejs');

// 


app.use(parseExpressHttpsRedirect());  // Require user to be on HTTPS.
app.use(express.bodyParser());
app.use(express.cookieParser('YOUR_SIGNING_SECRET'));
app.use(parseExpressCookieSession({ cookie: { maxAge: 3600000 } }));


// You could have a "Log In" link on your website pointing to this.
app.get('/login', function(req, res) {
  // Renders the login form asking for username and password.
  res.render('login.ejs');
});

// Clicking submit on the login form triggers this.
app.post('/login', function(req, res) {
  Parse.User.logIn(req.body.username, req.body.password).then(function() {
    // Login succeeded, redirect to homepage.
    // parseExpressCookieSession will automatically set cookie.
    res.redirect('/');
  },
  function(error) {
    // Login failed, redirect back to login form.
    res.redirect('/login');
  });
});

// In the main page.
app.post('/moveToLogin', function(req, res) {
  res.redirect('/login');
});

// You could have a "Log Out" link on your website pointing to this.
// get.........
app.get('/logout', function(req, res) {
  Parse.User.logOut();
  res.redirect('/login');
});

// The homepage renders differently depending on whether user is logged in.
app.get('/', function(req, res) {
  if (Parse.User.current()) {
    // No need to fetch the current user for querying Note objects.
    var Note = Parse.Object.extend("Post");  // Class Name
    var query = new Parse.Query(Note);

    
    query.find().then(function(results) {
      // Render the notes that the current user is allowed to see.
      
      // var OneNote = results.length;
      var OneNote = results[0];


      // THIS WORKS!!!!!!!!!!
      var testOneNote = OneNote.get('name');

      res.render('mainPage.ejs',{ message: testOneNote });
    },
    function(error) {
      // Render error page.
    });
    

    /*
    var query = new Parse.Query(Note);
    query.get("UaK9bmDt0o", {
      success: function(object) {
        // object is an instance of Parse.Object.



        res.render('mainPage.ejs',{ message: object.get('name') });
      },

      error: function(object, error) {
        // error is an instance of Parse.Error.
      }
    });
    */

  } else {
    // Render a public welcome page, with a link to the '/login' endpoint.
    res.redirect('/login');
  }
});

// You could have a "Profile" link on your website pointing to this.
app.get('/profile', function(req, res) {
  // Display the user profile if user is logged in.
  if (Parse.User.current()) {
    // We need to fetch because we need to show fields on the user object.
    Parse.User.current().fetch().then(function(user) {
      // Render the user profile information (e.g. email, phone, etc).
    },
    function(error) {
      // Render error page.
    });
  } else {
    // User not logged in, redirect to login form.
    res.redirect('/login');
  }
});

app.listen();