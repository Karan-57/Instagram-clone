var express = require("express");
var router = express.Router();
const userModel = require('./users');
const postModel = require('./posts');
const passport = require('passport');
const localStrategy = require('passport-local');
const upload = require('./multer');

passport.use(new localStrategy(userModel.authenticate));

// GET
router.get("/", async function(req, res) {
    const user = req.user ? await userModel.findOne({ username: req.user.username }) : null;
    res.render("index", { footer: req.user ? true : false, user });
});

router.get("/login", function(req, res) {
    res.render("login", { footer: true, user: null });
});



router.get("/feed", isLoggedIn, async function(req, res) {
    const user = await userModel.findOne({ username: req.user.username });
    const posts = await postModel.find().populate('user');
    res.render("feed", { posts, user });
});

router.get("/like/post/:id", isLoggedIn, async function(req, res) {
    const user = await userModel.findOne({ username: req.user.username });
    const post = await postModel.findOne({ _id: req.params.id });
    if (post.likes.indexOf(user._id) === -1) {
        post.likes.push(user);
    } else {
        // post.likes.pop() would pop only last user in array the one we want to pop
        post.likes.splice(post.likes.indexOf(user._id), 1);
    }
    await post.save();
    res.redirect('/feed');
});

router.get("/profile", isLoggedIn, async function(req, res) {
    const user = await userModel.findOne({ username: req.user.username }).populate('posts');
    res.render("profile", { footer: true, user });
});

router.get("/search", isLoggedIn, async function(req, res) {
    const user = await userModel.findOne({ username: req.user.username });
    res.render("search", { footer: true, user }); // pass user

});

router.get("/username/:username", isLoggedIn, async function(req, res) {
    const regex = new RegExp(`^${req.params.username}`, 'i');
    const users = await userModel.find({ username: regex });
    res.json(users);
});

router.get("/edit", isLoggedIn, async function(req, res) {
    const user = await userModel.findOne({ username: req.user.username }); //
    res.render("edit", { footer: true, user });
});

router.get("/upload", isLoggedIn, async function(req, res) {
    const user = await userModel.findOne({ username: req.user.username });
    console.log(user);
    res.render("upload", { footer: true, user }); // pass user

});
router.get("/userprofile", (req, res) => {
    res.render("userprofile", { footer: true, user: null }); //temporary null
});

router.get('/logout', function(req, res, next) {
    req.logout(function(err) {
        if (err) { return next(err) }
        res.redirect('/');
    });
});

//POST
router.post('/register',
    function(req, res, next) {
        const userData = new userModel({
            username: req.body.username,
            name: req.body.name,
            email: req.body.email
        });
        //to create model .register hashes and stores password in right field
        userModel.register(userData, req.body.password)
            .then(function(newUser) {
                // Manually log in the user
                req.login(newUser, function(err) {
                    if (err) return next(err);
                    res.redirect('/profile'); // now redirect works
                });
            })
            .catch(function(err) {
                console.log(err);
                res.redirect('/register'); // or show error
            });
    });



router.post('/login', passport.authenticate('local', {
    successRedirect: '/profile',
    failureRedirect: '/login'
}), function(req, res) {});

router.post('/update', upload.single('image'), async(req, res) => {
    const user = await userModel.findOneAndUpdate({ username: req.session.passport.user }, { username: req.body.username, name: req.body.name, bio: req.body.bio }, { new: true });
    if (req.file) { user.profileImage = req.file.filename; }
    await user.save();
    res.redirect('/profile');
});

// router.post('/register', function(req, res, next) {
//     const userData = new userModel({
//         username: req.body.username,
//         name: req.body.name,
//         email: req.body.email
//     });

//     // Register the user (hashes password and stores in DB)
//     userModel.register(userData, req.body.password)
//         .then(function(newUser) {
//             // Manually log in the user
//             req.login(newUser, function(err) {
//                 if (err) return next(err);
//                 res.redirect('/profile'); // now redirect works
//             });
//         })
//         .catch(function(err) {
//             console.log(err);
//             res.redirect('/register'); // or show error
//         });
// });

router.post("/upload", isLoggedIn, upload.single("image"), async function(req, res) {
    const user = await userModel.findOne({ username: req.user.username });
    const post = await postModel.create({
        picture: req.file.filename,
        caption: req.body.caption,
        user: user._id
    });
    user.posts.push(post._id);
    await user.save();
    res.redirect('/feed');
});


function isLoggedIn(req, res, next) {
    if (req.isAuthenticated()) { return next(); }
    res.redirect('/login');
}




module.exports = router;