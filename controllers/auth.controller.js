const { userModel } = require('../models');

async function getHomePage(req, res) {
    const user = req.user ? await userModel.findOne({ username: req.user.username }) : null;
    res.render("index", { footer: req.user ? true : false, user });
}

function getLoginPage(req, res) {
    res.render("login", { footer: true, user: null });
}

function registerUser(req, res, next) {
    const userData = new userModel({
        username: req.body.username,
        name: req.body.name,
        email: req.body.email
    });

    userModel.register(userData, req.body.password)
        .then(function (newUser) {
            req.login(newUser, function (err) {
                if (err) return next(err);
                res.redirect('/profile');
            });
        })
        .catch(function (err) {
            console.error("Registration error:", err);
            res.redirect('/');
        });
}

function logoutUser(req, res, next) {
    req.logout(function (err) {
        if (err) {
            return next(err);
        }
        res.redirect('/');
    });
}

module.exports = {
    getHomePage,
    getLoginPage,
    registerUser,
    logoutUser
};
