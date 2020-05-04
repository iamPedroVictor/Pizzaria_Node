const mysql = require('mysql');
const config = require('../config/config');

module.exports = {
    conectarBanco(query,callback, error, options = null ){
        const con = mysql.createConnection({
            host: config.host,
            user: config.user,
            password: config.password,
            database : config.database
        });
        con.connect(function(err){
            if (err) error(err);
            con.query(query, options,function (err, result) {
                if (err) throw err;
                callback(result);
              });
        });
    }


};