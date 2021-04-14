var tmp = {}

function loadTmp(onreset=false){
    tmp.TUeff=[[10,2],D(0),D(1)]
    tmp.factorCost=getFactorCost()
    tmp.gain=getFactorIncrease()
    tmp.tupgs=[D(100),D(500),D(1000)]
    tmp.TUcostScaling = [14,11,25]
    tmp.limit = D(2).pow((player.overflowAmt+1)*20)
}

function updateTmp(){

}