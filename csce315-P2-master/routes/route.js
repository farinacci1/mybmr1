var app = require('express');
var session = require('express-session');
var router = app.Router();
var HTMLParser = require('fast-html-parser');
const User = require('../core/user');
var yelp = require('../extern_modules/yelp')
const Cronofy = require("cronofy");
var spoon = require('../extern_modules/spoonacular')
const unirest = require('unirest');
var passport = require('passport');
const pool = require('../core/db');
passport.deserializeUser(function(id, done) {
    var bind =[]
    bind.push(id)
    let check = 'SELECT * FROM users WHERE authID = ?';
    var result = callback =>{
        pool.query(check,bind,function(err,rows,fields){
            if(err) callback(err,null);
            else callback(null,rows);
        });
    };
    result((err, rows) => {
        done(err, rows[0]);
    });
});

router.post('/isLogged',(req,res,next)=>{
    let userJson =JSON.stringify(req.user);
    if(typeof userJson !== 'undefined')
    {
        
        let user = JSON.parse(userJson);
        console.log(user)
        if(user.userName.length > 0) res.redirect('/home.html');
        else res.status(204).send();
    }
    else
    {
        res.status(204).send();
    }
   
});

const cronofyClient = new Cronofy({
    client_id: "hiPqunZWDaKQR2tBWEMUmhL18bLrnf75",
    client_secret: "fqd4Vu0O-gvtHs4-x5OT0QxST54kTL89vO0jMAq3-5brJmmldvMEIRYrsBlSVApAN5-VTmdhUm9GX4VN2_t8xg"
});

router.get("/authCal", function (req, res) {
    var rec_token = "";
    var access = "";
    var calID = "";
    var result_saved = "";
    var firstdone = false;
    var seconddone = false;
    const codeFromQuery = req.query.code;
    if (codeFromQuery != "") {
        const codeResponse = cronofyClient.requestAccessToken({
            client_id: 'hiPqunZWDaKQR2tBWEMUmhL18bLrnf75',
            client_secret: 'fqd4Vu0O-gvtHs4-x5OT0QxST54kTL89vO0jMAq3-5brJmmldvMEIRYrsBlSVApAN5-VTmdhUm9GX4VN2_t8xg',
            grant_type: "authorization_code",
            code: codeFromQuery,
            redirect_uri: "https://bmr-app.herokuapp.com/index2.html/"

        });
        codeResponse.then(result => {
            access = result.access_token;
            result_saved = result;
            const userInfos = cronofyClient.listCalendars({
                access_token: access,
            });
            userInfos.then(resp => {
                var i = 0;
                while (result_saved.linking_profile.profile_id != resp.calendars[i].profile_id) { i++; }
                calID = resp.calendars[i].calendar_id;


                var createOptions = {
                    calendar_id: calID,
                    access_token: access,
                    event_id: "qTtZdczOccgaPncGJaCiLg",
                    summary: "Cronofy Test",
                    description: "Discuss plans for the next quarter.",
                    start: "2020-04-25T15:30:00Z",
                    end: "2020-04-25T17:00:00Z",
                    location: {
                        description: "Board room"
                    }
                };

                const create = cronofyClient.createEvent(createOptions);
                create.then(resp => {
                    firstdone = true;
                    if (seconddone) {
                        res.json({
                            'token': rec_token,
                            'access': access,
                            'cal': calID
                        })
                    }
                }).catch(e => { console.log(e); });
            }).catch(e => { console.log(e); });
        }).catch(e => { console.log(e); });
    }
    const token = cronofyClient.requestElementToken({
        version: "1",
        permissions: ["account_management"],
        subs: ["acc_5ea122c049690a0100b81673"],
        origin: "https://bmr-app.herokuapp.com"

    });
    token.then(result => {
        console.log("gets " + calID);
        rec_token = result.element_token.token
        seconddone = true;
        if (firstdone || codeFromQuery == "") {
            res.json({
                'token': rec_token,
                'access': access,
                'cal': calID
            })
        }
    }).catch(e => { console.log(e); });
});




router.get("/sendToCal", function (req, res) {
    var createOptions2 = {
        calendar_id: req.query.cal,
        access_token: req.query.access,
        event_id: req.query.id,
        summary: req.query.title,
        description: "Meal plan",
        start: req.query.start,
        end: req.query.end,
        location: {
            description: ""
        }
    };

    const createnew = cronofyClient.createEvent(createOptions2);
    createnew.then(resp => {
        console.log("we did it again");


    }).catch(e => { console.log(e); });
});




router.get("/index2.html/*", function (req, res) {
    res.redirect('/index2.html?code=' + req.query.code);

});



router.get('/auth/google',passport.authenticate('google',
{scope : ['profile']}
));

router.get('/auth/google/redirect',function(req,res,next){
    passport.authenticate('google',function(err,user,info)
    {
       console.log(user);
        if(!user) res.redirect('/')
        req.logIn(user,function(err)
        {
            if(err) return next(err);
            return res.redirect('/index2.html');
        });
    })(req,res,next);
});
router.post('/queryYelpAPIrest', function (req, res, next) {
    let out = yelp.search(req.body.query, req.body.lat, req.body.long, req.body.price, req.body.distance, req.body.sort);
    out.then(response => {
        res.json({ 'query': response })
    }).catch(e => { console.log(e); });
});
router.post('/queryYelpAPIBusiness',function(req,res,next){
    // we can later make an abstraction for client.business in the yelp.js
    let out = yelp.client.business(req.body.identifier);
    
    out.then(response => {
        res.json({'query': response})
    }).catch(e => {console.log(e);});
});
router.post('/queryYelpAPIAutocomplete', (req, res, next) => {
    yelp.client.autocomplete({'text': req.body.incompleteSearch}).then( (response) => {
        res.json({'query': response});
    }).catch(e => { console.log(e) });
});

router.post('/pref/save', function (req, res, next){
    let calVal = req.body.calories || 0
    let budgVal =req.body.money || 0
	let userInput = {
		calorieInput: calVal,
		moneyInput: budgVal
	}
    let userJson =JSON.stringify(req.user);
    let user = JSON.parse(userJson);
    var bind = [];
    bind.push(parseInt(userInput.calorieInput))
    bind.push(parseInt(userInput.moneyInput))
    bind.push(user.authID);
    bind.push(user.authMethod);
	var sql = 'UPDATE USERS SET calorieBudget = ?, moneyBudget = ? WHERE authID = ? AND authMethod = ?;';
	var pool = require('../core/db');
	pool.query(sql,bind, function (err, result) {
        if (err) {
            console.error(err.message)
            return next(err);
        };
        console.log("Preferences Updated");
        res.status(204).send();
    });

});
router.post('/fetchUserProfile', function (req, res, next){
    let user = req.user;
    //user.authID, user.authMethod, user.userName,user.calorieBudget,user.moneyBudget
    res.json({'name': user.userName, 'budget': user.moneyBudget,'calories' : user.calorieBudget});
});
router.post('/logout',function(req,res,next){
    req.logout();
    res.redirect('/');
});
router.post('/saveLocalMeal', function(req, res, next){
    console.log("you are here")
    console.log(req.body)
    res.status(204).send()
});
router.post('/retrieveSessionMeal', function(req, res, next){
    if(typeof(req.session._mealPlan) !== 'undefined'){
        res.json({mealPlan : res.session.mealPlan});
    }
});
router.post('/getFavorites', function(req,res,next){
    let getFavorites = 'SELECT itemId, API from favorites where authID like ? and status = true';
    var bind = [];
    bind.push(req.user.authID);
    var result = callback =>{
        pool.query(getFavorites,bind,function(err,rows,fields){
            if(err) callback(err,null);
            else callback(null,rows);
        });
    };
    result((err, rows) => {
        res.json({"result":rows});
    });
});
router.post('/addFavorite', function(req,res,next){
    let itemId = req.body.id;
    let api = req.body.API;
    let status = true;
    var insert = 'INSERT INTO favorites (authID, itemId, API, status) VALUES (?,?,?,?);';
    var bind =[];
    bind.push(req.user.authID);
    bind.push(itemId)
    bind.push(api)
    bind.push(status);
    console.log(bind)

	pool.query(insert,bind, function (err, result) {
        if (err) {
            console.error(err.message)
            return next(err);
        };
        console.log(result);
        console.log("Favorite Added");
        res.json({});
    });
})

router.post('/getBlacklist', function(req,res,next){
    let getFavorites = 'SELECT itemId, API from favorites where authID like ? and status = false';
    var bind = [];
    bind.push(req.user.authID);
    var result = callback =>{
        pool.query(getFavorites,bind,function(err,rows,fields){
            if(err) callback(err,null);
            else callback(null,rows);
        });
    };
    result((err, rows) => {
        res.json({"result":rows});
    });
});
router.post('/addBlacklist', function(req,res,next){
    let itemId = req.body.id;
    let api = req.body.API;
    let status = false;
    var insert = 'INSERT INTO favorites (authID, itemId, API, status) VALUES (?,?,?,?);';
    var bind =[];
    bind.push(req.user.authID);
    bind.push(itemId)
    bind.push(api)
    bind.push(status);
    console.log(bind)

	pool.query(insert,bind, function (err, result) {
        if (err) {
            console.error(err.message)
            return next(err);
        };
        console.log(result);
        console.log("Blacklisted item Added");
        res.status(204).send();
    });
})

module.exports = router;
