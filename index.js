const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const mysql = require('./src/database/MysqlConnection');
const cookieParser = require('cookie-parser');

app.set('view engine', 'ejs');
app.use(express.static('public'));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());

app.get('/', (req, res) => {
    res.render('index');
});

app.get('/Cliente', (req, res) => {
    res.render('cliente');
});

app.get('/Categoria', (req, res) => {
    res.render('categoria');
});

app.get('/Pedido', (req,res) => {
    res.render('confirmarcliente')
});


app.get('/Produto', (req, res) => {
    const query = "SELECT * FROM `categoria`";
    mysql.conectarBanco(query,
        (result) => {
            res.render('produto', { categorias: result});
        },
        () => {
            console.log('erro produto');
        });    
});

app.get('/Cardapio', (req,res) => {
    const query = "SELECT id,nome,descricao,status,id_categoria,preco FROM `produto` where `status`='Disponivel'";
    mysql.conectarBanco(query,
        (result) => {
            console.log('Cookies:',req.cookies);
            res.render('cardapio', {produtos:result, cliente: req.cookies.usuario});
        },
        () => {
            console.log('Erro cardapio get');
        });
});


app.post('/Cliente', (req, res) => {
    const clienteData = req.body; 
    const query = "INSERT INTO `cliente` (`nome`, `cpf`, `telefone`) VALUES ('"+clienteData.nome+"','"+clienteData.cpf+"', '"+clienteData.telefone+"')";
    mysql.conectarBanco(query, () => {
        res.render('cliente');
    } ,() => {
        console.log('erro');
    });
});

app.post('/Categoria', (req, res) => {
    const categoriaData = req.body;
    const query = "INSERT INTO `categoria` (`nome`) VALUES ('" + categoriaData.titulo + "')";
    mysql.conectarBanco(query, ()=> {
        res.render('categoria');
    },
    ()=> {
        console.log("erro");
    });
});

app.post('/Produto', (req,res) => {
    const produtoData = req.body;
    const query = "INSERT INTO `produto` (`nome`, `preco`, `descricao`, `status`, `id_categoria`) VALUES ('"+ produtoData.nome +"', '"+ produtoData.preco +"', '"+ produtoData.descricao +"', '"+ produtoData.statusProduto +"', '" + produtoData.id_categoria + "')";
    mysql.conectarBanco(query, () => {
        const query = "SELECT * FROM `categoria`";
        mysql.conectarBanco(query,
            (result) => {
                res.render('produto', { categorias: result});
            },
            () => {
                console.log('erro produto');
            }); 
    },
    ()=> {
        console.log("erro produto post");
    });
});

app.post('/login', (req,res) => {
    const clienteLogin = req.body;
    const query = "SELECT * FROM `cliente` WHERE cpf = '"+ clienteLogin.cpf +"' AND nome ='"+ clienteLogin.nome +"'";
    mysql.conectarBanco(query,
        (result) => {
            if(result.length == 1){
                console.log(result);
                res.status(200)
                .cookie('usuario',clienteLogin.nome)
                .redirect(301, '/Cardapio');
            }else {
                return res.render('confirmarcliente', {logado: "nao"});
            }
        });
});
  
app.listen(3001, function () {
    console.log('Example app listening on port 3001!');
});