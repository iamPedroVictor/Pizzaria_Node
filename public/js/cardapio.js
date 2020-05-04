function createCookie(data){
    var now = new Date();
    var oneHour = 1 * 3600 * 1000;
    now.setTime(now.getTime() + oneHour);
    document.cookie = "produtos="+data+",expires=" + now.toUTCString()+ ", path=/";
}

function GetProdutosData(){
    var cookies = document.cookie;
    if(cookies.indexOf("[{") == -1){
        return null;
    }
    var positionInicial = cookies.indexOf("[{");
    var positionFinal = cookies.indexOf("}]")+2;
    return cookies.substring(positionInicial,positionFinal);
}

function add(id){
    var pedido = GetProdutosData();
    var pedidoJson = [];
    if(pedido != null) pedidoJson = JSON.parse(pedido);
    var pedidos = pedidoJson.length;
    var ultimoIdMenor = 0;
    var novo = true;
    for(var i=0; i < pedidos; i++){
        if(pedidoJson[i].id === id){
            pedidoJson[i].quantidade++;
            novo = false;
            if(pedidoJson[i].id < id){
                ultimoIdMenor = i;
            }
            break;
        }
    }
    if(novo){
        pedidoJson.splice(ultimoIdMenor+1, 0, {id,quantidade:1});
    }
    createCookie(JSON.stringify(pedidoJson));
}

function remove(id){
    var pedido = GetProdutosData();
    var pedidoJson = JSON.parse(pedido);
    if(pedidoJson == null) pedidoJson = [];
    var pedidos = pedidoJson.length;
    var novo = true;
    for(var i=0; i < pedidos; i++){
        if(pedidoJson[i].id === id){
            if(pedidoJson[i].quantidade > 0){
                pedidoJson[i].quantidade--;
                novo = false;
            }
            break;
        }
    }
    createCookie(JSON.stringify(pedidoJson));
}