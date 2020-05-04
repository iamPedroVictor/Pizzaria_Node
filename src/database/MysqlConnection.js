const mysql = require('mysql');

module.exports = {
    conectarBanco(query,callback, error, options = null ){
        const con = mysql.createConnection({
            host: "localhost",
            user: "root",
            password: "",
            database : 'pizzaria'
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