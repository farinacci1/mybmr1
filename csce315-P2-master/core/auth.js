var passport = require('passport');
var GoogleStrategy = require('passport-google-oauth20').Strategy;
const keys = require('./keys')
const pool = require('./db');

class UserObj
{
    constructor(uUid,uName,specifier)
    {
        this.id = uUid;
        this.name = uName;
        this.method = specifier;
    }
    
}
passport.serializeUser(function(user, done) {
    done(null, user.id)
});

function findById(id)
{
    var bind =[]
    bind.push(id)
    let check = 'SELECT * FROM users WHERE authID = ?';
    var result = callback =>{
        pool.query(check,bind,function(err,rows,fields){
            if(err) callback(err,null);
            else callback(null,rows);
        });};
    return result;

}
function find(user = null)
{
    var bind = [];
    bind.push(user.id);
    bind.push(user.method);
    let check = 'SELECT * FROM users WHERE authID = ? AND authMethod = ?';
    var result = callback =>{
        pool.query(check,bind,function(err,rows,fields){
            if(err) callback(err,null);
            else callback(null,rows);
        });
    };
    return result;
}
function create(user=null) 
{
    var bind = [];
    let create = 'INSERT INTO users(authID, authMethod,lastLOGIN,createdOn,calorieBudget,moneyBudget,userName) VALUES (?,?,CURRENT_TIMESTAMP, CURRENT_TIMESTAMP,2000,100,?);';
    bind.push(user.id);
    bind.push(user.method);
    bind.push(user.name)
    var result = callback =>{
        pool.query(create,bind,function(err,rows,fields){
            if(err) callback(err,null);
            else callback(null,rows);
        });
    };
    return result;
}
passport.use( 
    new GoogleStrategy({
        clientID : keys.google.clientID,
        clientSecret : keys.google.clientSecret,
        callbackURL : '/auth/google/redirect'
    } , (accessToken,refreshToken,profile,done)=>
    {
        var logUser = null;
        let uuid = profile.id;
        let specifier = 'google';
        let uname = profile.displayName;
        logUser = new UserObj(uuid, uname,specifier);
        var foundRecords = find (logUser);
        foundRecords((err, rows) => 
        {
            if(err)return done(err,logUser);
            else
            {
                if(rows.length > 0) 
                {
                    console.log("user found in db");
                    return done(null, logUser)
                }
                else{
                    var insertRecord = create(logUser);
                    insertRecord((err2, rows2) => {
                        if(err2) return done(err2,logUser);
                        else{
                            console.log("user created");
                            return done(null, logUser)
                        }
                    });
                   
                }
            }
        });


    })
)
