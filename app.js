const createError = require('http-errors');
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const expressSession = require('express-session');
const passport = require('passport');

const indexRouter = require('./routes/index');
const { userModel } = require('./models');

const app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(expressSession({
    resave: false,
    saveUninitialized: false,
    secret: process.env.SESSION_SECRET || "heyheyehhdd"
}));

app.use(passport.initialize());
app.use(passport.session());

passport.use(userModel.createStrategy());
passport.serializeUser(userModel.serializeUser());
passport.deserializeUser(userModel.deserializeUser());

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use('/images/uploads', express.static(path.join(__dirname, 'public/images/uploads')));

// Helper available in all EJS templates to resolve image paths:
// If string starts with http(s), use it directly (ImageKit).
// Otherwise prepend /images/uploads/ (local files/defaults).
app.use((req, res, next) => {
    res.locals.getImageUrl = function (imagePath, fallback = '/images/uploads/default.png') {
        if (!imagePath) return fallback;
        if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
            return imagePath;
        }
        return `/images/uploads/${imagePath}`;
    };
    next();
});

app.use('/', indexRouter);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
    next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
    res.locals.message = err.message;
    res.locals.error = req.app.get('env') === 'development' ? err : {};

    res.status(err.status || 500);
    res.render('error');
});

module.exports = app;