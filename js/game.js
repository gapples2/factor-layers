var player = {}
const D = x=>new Decimal(x)
const nameThings = ["second","third","fourth","fifth","sixth","seventh","eighth","ninth","tenth"]
const version = ["0.00.1","Saving"]

function startingPlayer(){
    return {
        totalite: D(1),
        layers: [D(1)],
        time: 0,
        factorStuff:{
            nextForGain: 0,
            amountWaiting: D(0),
        },
        tupgs: [0,0,0],
        tupgsUnlocked: [false,false,false,false],
        overflowAmt: 0,
        op: 0,
        oupgs: [],
    }
}

function generateNewLayer(){
    if(player.totalite.min(tmp.limit).gte(tmp.factorCost)){
        player.totalite=D(1)
        for(let x=0;x<player.layers.length;x++){
            player.layers[x]=D(1)
        }
        player.factorStuff.nextForGain=0
        player.factorStuff.amountWaiting=D(0)
        player.layers.push(D(1))
        tmp.factorCost=getFactorCost()
    }
}

function loadGame(){
    if(localStorage.factorLayers){
        load()
    }else{
        player=startingPlayer()
        player.time = D(Date.now()).toFixed(0)
        loadTmp()
    }
    setInterval(save,1000)
    setInterval(update,20)
    setInterval(baseloop,20)
}

function increaseFactor(id,amt){
    let oldLayer = player.layers[id]
    player.layers[id]=player.layers[id].add(amt)
    player.totalite=player.totalite.div(oldLayer).mul(player.layers[id])
}

function getFactorIncrease(){
    let amt = D(1).add(tmp.TUeff[1]).mul(tmp.TUeff[2])
    if(hasOPupgrade(1))amt=amt.pow(1.1)
    return amt.floor()
}

function format(x,p=0,infinity=true){
    let d = D(x)
    if(d.gte(tmp.limit)&&infinity)return "Infinity"
    if(d.gte(1e3)){
        let e = d.log10().floor()
        let m = d.div(D(10).pow(e))
        if(m.toFixed(p)>=10){
            m=D(1)
            e=e.plus(1)
        }
        return m.toFixed(p)+"e"+e.toString()
    }
    return d.toFixed(p)
}

function loop(diff){
    diff/=1000
    let gain = tmp.gain
    player.factorStuff.amountWaiting=player.factorStuff.amountWaiting.add(gain.mul(diff))
    if(player.factorStuff.amountWaiting.mul(hasOPupgrade(2)?2:1).gte(gain)){
        increaseFactor(player.factorStuff.nextForGain,gain)
        player.factorStuff.amountWaiting=D(0)
        player.factorStuff.nextForGain++
        if(player.factorStuff.nextForGain>=player.layers.length)player.factorStuff.nextForGain=0
    }
}

function baseloop(){
    if(!(format(player.totalite)=="Infinity"))loop(Date.now()-player.time)
    player.time=Date.now()
}

function getFactorCost(){
    return D(tmp.TUeff[0][0]).pow(D(tmp.TUeff[0][1]).pow(player.layers.length-1)).floor()
}

function buyTotaliteUpgrade(id){
    if(player.totalite.min(tmp.limit).gte(tmp.tupgs[id])&&(id==0?getTupgAmt(id)<10:true)){
        player.totalite=D(1)
        for(let x=0;x<player.layers.length;x++){
            player.layers[x]=D(1)
        }
        player.factorStuff.nextForGain=0
        player.factorStuff.amountWaiting=D(0)
        player.tupgs[id]++
        let costScaling = tmp.TUcostScaling
        let cSS = [3,5,3]
        tmp.tupgs[id]=tmp.tupgs[id].mul(costScaling[id])
        tmp.TUcostScaling[id]+=cSS[id]
        tmp.TUeff[id]=getTupgEffect(id)
        if(id==0)tmp.factorCost=getFactorCost()
        else tmp.gain = getFactorIncrease()
    }
}

function getTupgEffect(id){
    let upgAmt = D(getTupgAmt(id))
    switch(id){
        case 0: {
            let effect=[D(10).minus(upgAmt.div(2)),2]
            if(hasOPupgrade(0))effect[1]=1.9
            return effect
        }
        case 1:{
            let base = D(1)
            return base.mul(upgAmt)
        }
        case 2:{
            let base = D(1.5)
            return base.pow(upgAmt)
        }
    }
}

function getTupgAmt(id){
    return player.tupgs[id]
}

function overflow(){
    player.totalite=D(1)
    player.layers=[D(1)]
    player.factorStuff.nextForGain=0
    player.factorStuff.amountWaiting=D(0)
    player.tupgs=[0,0,0]
    player.overflowAmt++
    player.op++
    loadTmp(true)
}

function buyOverflowUpgrade(id){
    let costs = [1,1,2]
    if(costs[id]<=player.op){
        player.op-=costs[id]
        player.oupgs.push(id) 
        if(id==0){tmp.TUeff[0]=getTupgEffect(0);tmp.factorCost=getFactorCost()}
        else tmp.gain = getFactorIncrease()
    }
}

function hasOPupgrade(id){
    return player.oupgs.includes(id)
}

loadGame()