var express = require('express.io');
var fs = require('fs');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');

var indexRoutes = require('./routes/index');
var previewRoutes = require('./routes/preview');
var photoRoutes = require('./routes/photo');

var app = express();
app.http().io();

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRoutes);
app.use('/preview', previewRoutes);
app.use('/photo', photoRoutes);

app.io.route('led', {
    set: function(req) {
        app.get('BUTTON_WRITE').write(req.data ? '1' : '0');
    }
});

app.set('IP_CAMERA_URL', 'http://192.168.1.198:8080');
app.set('PHOTO_PATH', __dirname + '/photos');

app.set('BUTTON_SERIAL_FILENAME', '/dev/cu.usbmodemfd121');
app.set('BUTTON_READ', fs.createReadStream(app.get('BUTTON_SERIAL_FILENAME')));
app.set('BUTTON_WRITE', fs.createWriteStream(app.get('BUTTON_SERIAL_FILENAME')));

app.get('BUTTON_READ').on('data', function(data) {
    data = data.toString();
    if (data === 'b') {
        app.io.broadcast('button:press');
    }
});

app.use(function(req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

if (app.get('env') === 'development') {
    app.use(function(err, req, res, next) {
        res.status(err.status || 500);
        res.render('error', {
            message: err.message,
            error: err
        });
    });
}

app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
        message: err.message,
        error: {}
    });
});

module.exports = app;