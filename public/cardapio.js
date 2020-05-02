function add(id){
    var pedido = localStorage.getItem('pedido');
    var pedidoJson = JSON.parse(pedido);
    if(pedidoJson == null) pedidoJson = [];
    var pedidos = pedidoJson.length;
    var novo = true;
    for(var i=0; i < pedidos; i++){
        if(pedidoJson[i].id === id){
            pedidoJson[i].quantidade++;
            novo = false;
            break;
        }
    }
    if(novo){
        pedidoJson.push({id,quantidade:1});
    }
    localStorage.setItem('pedido', JSON.stringify(pedidoJson));
}

function remove(id){
    var pedido = localStorage.getItem('pedido');
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
    localStorage.setItem('pedido', JSON.stringify(pedidoJson));
}