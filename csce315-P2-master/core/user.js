const pool = require('./db');
const bcrypt = require('bcryptjs');

function User(){};

User.prototype = {

    find : function(user = null, callback)
    {
       
        var bind = [];
        bind.push(user.id);
        bind.push(user.method);
        let check = 'SELECT * FROM users WHERE authID = ? AND authMethod = ?';
        pool.query(check,bind,function(err,result){
            if(err){
                console.error(err.message);
                return callback(null);
            }
            if(result.length) {
                callback(result[0]);
            }else {
                callback(null);
            }
        });
    },
    create : function(user=null, callback) 
    {
        let create = 'INSERT INTO users(authID, authMethod,lastLOGIN,createdOn,calorieBudget,moneyBudget) VALUES (?,?,CURRENT_TIMESTAMP, CURRENT_TIMESTAMP,2000,100);';
        bind.push(user.id);
        bind.push(user.method);
        pool.query(create, bind, function(err, result) {
            if(err) {
                console.error(err.message);
                return callback(null);
            }
            // return the last inserted id. if there is no error
            //console.log("user created succesfully");
            callback(result.insertId);
        });   

    }
}
module.exports = User;