var express = require('express');
var app = express();
var morgan = require('morgan');
var path = require('path');

app.set('port', (process.env.PORT || 5000));
app.use(morgan('short'));
app.use(express.static(__dirname + '/public'));

// views is directory for all template files
app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');

// routing
app.get('/', function(request, response) {
  response.sendFile(path.join(__dirname, 'main.html'));
});

app.listen(app.get('port'), function() {
  console.log('Node app is running on port', app.get('port'));
});
