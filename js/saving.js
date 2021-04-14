function save(){
    let data = {
        player,tmp
    }
    localStorage.factorLayers=JSON.stringify(data)
}

function load(){
    let save = JSON.parse(localStorage.factorLayers)
    save = decimalize(save)
    player=save.player
    tmp=save.tmp
}

function decimalize(save){
    let decimalizeThings = [["totalite","layers"],["limit","tupgs","TUeff"]]
    let player = save.player
    let tmp = save.tmp
    player.totalite=D(player.totalite)
    for(let x=0;x<player.layers.length;x++){
        player.layers[x]=D(player.layers[x])
    }
    player.factorStuff.amountWaiting=D(player.factorStuff.amountWaiting)
    tmp.limit=D(tmp.limit)
    for(let x=0;x<3;x++){
        if(x!=0)tmp.TUeff[x] = D(tmp.TUeff[x])
        tmp.tupgs[x]=D(tmp.tupgs[x])
    }
    tmp.factorCost=D(tmp.factorCost)
    tmp.gain=D(tmp.gain)
    let unlocks = player.tupgsUnlocked
    for(let x=0;x<4;x++){
        if(x==3){
            if(unlocks[3])changeDisplay("add_layer_button",true)
        }else{
            if(unlocks[x])changeDisplay("tupg_"+(x+1))
        }
    }
    return {player,tmp}
}