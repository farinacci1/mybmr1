const util = require('util');
const mysql = require('mysql');
/**connect to database */

const pool = mysql.createPool({
    connectionLimit: 25,
    host : 'us-cdbr-iron-east-01.cleardb.net',
    user : 'be0d4e7ee1d78b',
    password : '466266ac',
    database : 'heroku_8708fcfaf1cc85b'
});

pool.getConnection((err,connection)=>{
    if(err) return console.error(err.message);
    if(connection) connection.release();
    return;
})
pool.query = util.promisify(pool.query);
module.exports = pool;