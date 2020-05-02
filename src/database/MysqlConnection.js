const mysql = require('mysql');

module.exports = {
    conectarBanco(query, callback, error){
        const con = mysql.createConnection({
            host: "localhost",
            user: "root",
            password: "",
            database : 'pizzaria'
        });
        con.connect(function(err){
            if (err) error(err);
            con.query(query,function (err, result) {
                if (err) throw err;
                console.log("Resultado: ",result);
                callback(result);
              });
        });
    }


};