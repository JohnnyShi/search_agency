var express = require('express');
var app = express();
var morgan = require('morgan');

app.set('port', (process.env.PORT || 5000));

app.use(morgan('short'));

// GET requests from /public
app.use(express.static(__dirname + '/public'));

// views is directory for all template files
app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');

// // routing
app.get('/', function(request, response) {
  response.send('Hello World!')
});

app.listen(app.get('port'), function() {
  console.log('Node app is running on port', app.get('port'));
});
