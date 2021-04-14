var player = {}
const D = x=>new Decimal(x)
const nameThings = ["second","third","fourth","fifth","sixth","seventh","eighth","ninth","tenth","eleventh"]
const version = ["0.01.1","The 8th Dimension (small bug fix)"]
const oupgCosts = [1,1,2,2,3,5,7,7]

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
    let base = D(1).add(tmp.TUeff[1])
    if(hasOPupgrade(3))base=base.mul(3)
    let amt = base.mul(tmp.TUeff[2])
    if(hasOPupgrade(4))base=base.mul(D(1.01).pow(D(player.tupgs[0]).add(player.tupgs[1]).add(player.tupgs[2])))
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
    if(hasOPupgrade(7)&&canAffordAnyTotaliteUpgrade()){
        for(let x=0;x<3;x++){
            buyTotaliteUpgrade(x)
        }
    }
    let gain = tmp.gain
    player.factorStuff.amountWaiting=player.factorStuff.amountWaiting.add(gain.mul(diff))
    if(player.factorStuff.amountWaiting.mul(hasOPupgrade(2)?2:1).gte(gain)){
        if(!hasOPupgrade(5))increaseFactor(player.factorStuff.nextForGain,gain)
        else{
            for(let x=0;x<player.layers.length;x++){
                increaseFactor(x,gain)
            }
        }
        player.factorStuff.amountWaiting=D(0)
        player.factorStuff.nextForGain++
        if(player.factorStuff.nextForGain>=player.layers.length)player.factorStuff.nextForGain=0
    }
}

function baseloop(){
    if(!(format(player.totalite)=="Infinity"))loop(Date.now()-player.time)
    player.time=Date.now()
}

function canAffordAnyTotaliteUpgrade(){
    return tmp.tupgs[0].lte(player.totalite)||tmp.tupgs[1].lte(player.totalite)||tmp.tupgs[2].lte(player.totalite)
}

function getFactorCost(){
    return D(tmp.TUeff[0][0]).pow(D(tmp.TUeff[0][1]).pow(player.layers.length-1)).floor()
}

function buyTotaliteUpgrade(id){
    if(player.totalite.gte(tmp.tupgs[id])&&player.totalite.lt(tmp.limit)){
        if(!hasOPupgrade(6)){
            player.totalite=D(1)
            for(let x=0;x<player.layers.length;x++){
                player.layers[x]=D(1)
            }
            player.factorStuff.nextForGain=0
            player.factorStuff.amountWaiting=D(0)
        }
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
            if(upgAmt>=10)effect[0]=D(5).minus((upgAmt-10)/100)
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

function overflow(forced=false){
    player.totalite=D(1)
    player.layers=[D(1)]
    player.factorStuff.nextForGain=0
    player.factorStuff.amountWaiting=D(0)
    player.tupgs=[0,0,0]
    if(!forced){
        player.overflowAmt++
        player.op++
    }
    loadTmp(true)
}

function buyOverflowUpgrade(id){
    let costs = oupgCosts
    if(costs[id]<=player.op&&!hasOPupgrade(id)){
        player.op-=costs[id]
        player.oupgs.push(id) 
        if(id==0){tmp.TUeff[0]=getTupgEffect(0);tmp.factorCost=getFactorCost()}
        else tmp.gain = getFactorIncrease()
    }
}

function hasOPupgrade(id){
    return player.oupgs.includes(id)
}

function respecOPupgrades(){
    let doComfirm = confirm("Are you sure you want to respec? It will do an overflow reset without you gaining anything.")
    if(!doComfirm)return;
    player.oupgs=[]
    player.op=player.overflowAmt
    overflow(true)
}

loadGame()