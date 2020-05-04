const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const mysql = require('./src/database/MysqlConnection');
const cookieParser = require('cookie-parser');
const config = require('./src/config/config');

app.set('view engine', 'ejs');
app.use(express.static('public'));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());

const isUserAuth = (req, res) => {
    if(req.cookies.logado !== "true")
        res.redirect(301,'/Pedido');
};


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
    if(req.cookies.logado === 'true'){
        res.redirect(301,'/Cardapio');
    }
    res.render('confirmarcliente', 
    {logado:req.cookies.logado, falhalogin:req.cookies.falhalogin})
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
    const query = "SELECT * FROM `produto` where `status`='Disponivel'";
    isUserAuth(req,res);
    mysql.conectarBanco(query,
        (result) => {
            console.log('Cookies:',req.cookies);
            res.render('cardapio', {produtos:result, cliente: req.cookies.usuario});
        },
        () => {
            console.log('Erro cardapio get');
        });
});

app.get('/InfoPedido', (req,res) => {
    const query = "SELECT * FROM `pedido_produto` WHERE id_pedido=?";
    mysql.conectarBanco(query, 
        (result) => {
            let total = result.reduce((totalValor, row) => {
                return totalValor += (row.quantidade, row.preco_produto);
            }, 0);
            total = Number(total).toFixed(2);
            res.render('infopedido', 
                {
                    pedido: req.cookies.pedidoID,
                    produtos: result,
                    total
                });
            
        }, 
        () => console.log('InfoPedido'),
        req.cookies.pedidoID);
});

app.get('/Carrinho', (req,res) => {
    isUserAuth(req,res);
    const produtos = req.cookies.produtos.split("},");
    produtos[0] = produtos[0].substring(1);
    const indexLast = produtos[produtos.length-1].indexOf("],");
    produtos[produtos.length-1] = produtos[produtos.length-1].substring(0,indexLast-1);
    const produtos2 = [];
    const produtosIds = produtos.map(produto => {
        if(produto.indexOf("}") == -1){
            produto += "}";
        }
        const produtoJSON = JSON.parse(produto);
        produtos2.push(produtoJSON);
        return produtoJSON.id;
    });
    const totalIds = "?,".repeat(produtosIds.length);
    const query = "SELECT * from `produto` WHERE `id` IN (" + totalIds.substring(0,totalIds.length-1)+")";
    mysql.conectarBanco(query,
        result => { 
            let total = 0;
            let data = result.map((row, index)=>{
                total += row.preco * produtos2[index].quantidade;
                return Object.assign({}, row, {quantidade: produtos2[index].quantidade});
            });
            data = data.filter(row => {
                if(row.quantidade > 0){
                    return true;
                }else{
                    return false;
                }
            });
            res.render('carrinho', {produtos:data, TotalValor:total});
        },
        () => console.log("erro carrinho get"),
        produtosIds);
});


app.post('/Cliente', (req, res) => {
    const clienteData = req.body; 
    const query = "INSERT INTO `cliente` (`nome`, `cpf`, `telefone`) VALUES (?,?,?)";
    const values = [clienteData.nome, clienteData.cpf, clienteData.telefone];
    mysql.conectarBanco(query, () => {
        res.render('cliente');
    } ,() => {
        console.log('erro');
    }, values);
});

app.post('/Categoria', (req, res) => {
    const categoriaData = req.body;
    const query = "INSERT INTO `categoria` (`nome`) VALUES (?)";
    mysql.conectarBanco(query, ()=> {
        res.render('categoria');
    },
    ()=> {
        console.log("erro");
    }, categoriaData.titulo);
});

app.post('/Produto', (req,res) => {
    const produtoData = req.body;
    const query = "INSERT INTO `produto` (`nome`, `preco`, `descricao`, `status`, `id_categoria`) VALUES (?,?,?,?,?)";
    const values = [produtoData.nome, produtoData.preco, produtoData.descricao, produtoData.statusProduto, produtoData.idCategoria]
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
    }, values);
});

app.post('/login', (req,res) => {
    const clienteLogin = req.body;
    const query = "SELECT * FROM `cliente` WHERE `cpf` = ? AND `nome` =?";
    const now = new Date();
    const oneHour = 1 * 3600 * 1000;
    now.setTime(now.getTime() + oneHour);
    mysql.conectarBanco(query,
        (result) => {
            if(result.length == 1){
                res.status(200)
                .cookie('usuario',clienteLogin.nome)
                .cookie('user_id', result[0].id)
                .cookie('logado', 'true')
                .redirect(301, '/Cardapio');
            }else {
                res.status(404)
                .cookie('logado',"false")
                .cookie('falhalogin',"true")
                .redirect(301,'/Pedido');
            }
        }, () => console.log("Error login"),
        [clienteLogin.cpf, clienteLogin.nome]);
});

const InsertDatabase = (query, values, callback) => {
    mysql.conectarBanco(query, (result) => {
        callback(result.insertId);
    } ,() => {
        console.log('erro');
    }, values);
};

app.post('/Pedido', async (req,res) => {
    isUserAuth(req,res);
    const produtos = req.cookies.produtos.split("},");
    produtos[0] = produtos[0].substring(1);
    const indexLast = produtos[produtos.length-1].indexOf("],");
    produtos[produtos.length-1] = produtos[produtos.length-1].substring(0,indexLast-1);

    const enderecoQuery = "INSERT INTO `endereco` (`rua`, `numero`, `bairro`) VALUES (?, ?, ?)";
    const enderecoData = [req.body.rua, req.body.numero, req.body.bairro];

    const inserirPedidosProdutos = (pedidoId) =>{
        for (let index = 0; index < produtos.length; index++) {
            const element = produtos[index] + '}';
            const elementjson = JSON.parse(element);
            const queryInsertPedidoProduto = "INSERT INTO `pedido_produto` (`id_pedido`, `id_produto`, `nome_produto`, `preco_produto`, `quantidade`) SELECT ?,?,nome,preco, ? from `produto` WHERE id=?";
            const PedidoProdutoValues = [pedidoId, elementjson.id, elementjson.quantidade, elementjson.id];
            mysql.conectarBanco(queryInsertPedidoProduto, (result) => {
                console.log("Pedido produto ok");
            } ,() => {
                console.log('erro');
            }, PedidoProdutoValues);
        }
        res.status(200)
            .cookie('pedidoID', pedidoId)
            .redirect(301, '/InfoPedido');
    };

    const inserirPedido = (enderecoId)=>{
        const queryInsertPedido = "INSERT INTO `pedido` (`id_cliente`, `id_endereco`) VALUES (?, ?)";
        const pedidoValues = [req.cookies.user_id, enderecoId];
        InsertDatabase(queryInsertPedido, pedidoValues, inserirPedidosProdutos);
    }

    InsertDatabase(enderecoQuery, enderecoData, inserirPedido);
});
  
app.listen(process.env.PORT, () => {
    console.log(`Example app listening on port ${config.port}!`);
});