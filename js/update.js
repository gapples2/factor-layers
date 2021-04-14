function update(){
    let resources = ["totalite","overflowAmt","op"]
    resources.forEach(id=>{
        let element = document.getElementById("resource_"+id)
        element.innerText = format(player[id],2)
    })
    let formatLayers = []
    player.layers.forEach(num=>{
        formatLayers.push(format(num,num.gte(1e3)?2:0))
    })
    document.getElementById("layers").innerText=formatLayers.join(", ")
    document.getElementById("new_layer_cost").innerText = nameThings[player.layers.length-1]+" layer for " + format(tmp.factorCost,2)
    let tupgids = [0,1,2]
    let types = ["cost","eff","amt"]
    tupgids.forEach(id=>{
        types.forEach(type=>{
            let element = document.getElementById("tupg_"+type+"_"+(id+1))
            if(type=="cost")element.innerText = format(tmp.tupgs[id],2)
            if(type=="eff"){
                let effect = tmp.TUeff[id]
                if(id!=0)element.innerText = format(effect,2)
                else element.innerHTML = format(effect[0],1)+"<sup>"+format(effect[1],2)+"<sup>"+player.layers.length+"</sup></sup> rounded down"
            }
            if(type=="amt")element.innerText = format(player.tupgs[id])
        })
    })
    if(player.totalite.gte(tmp.limit)){
        changeDisplay("overflow_div",true)
        changeDisplay("overflow_reset",true)
    }else changeDisplay("overflow_reset",false)
    document.getElementById("overflow_limit").innerHTML = format(tmp.limit,2,false)+" (2<sup>"+(player.overflowAmt+1)*20+"</sup>)"
    if(!document.getElementById("overflow_upg_1_bought")){
        let upgDiv = document.getElementById("overflow_upgs")
        let descs = [
            "Lower the second exponent in the new layer formula by 0.1.",
            "Raise layer gain to 1.1.",
            "Gaining layers is 2x faster."
        ]
        let costs = [1,1,2]
        for(let x=0;x<3;x++){
            let element=document.createElement("button")
            element.innerHTML=`Overflow Upgrade ${x+1}<br>${descs[x]}<br>Cost: ${costs[x]}.<br>[<span id="overflow_upg_${x+1}_bought"></span>]`
            element.onclick=bOU(x)
            upgDiv.appendChild(element)
        }
    }
    for(let x=0;x<3;x++){
        let element = document.getElementById("overflow_upg_"+(x+1)+"_bought")
        element.innerText = hasOPupgrade(x)?"BOUGHT":"IN SHOP"
    }
    if(!player.tupgsUnlocked[2]){
        let requirements = ["player.layers.length>=3","player.totalite.gte(500)","player.layers.length>=4"]
        for(let x=0;x<3;x++){
            if(player.tupgsUnlocked[x])continue;
            if(!eval(requirements[x]))continue;
            player.tupgsUnlocked[x]=true
            changeDisplay("tupg_"+(x+1),true)
        }
    }
    if(!player.tupgsUnlocked[3]&&player.totalite.gte(10)){player.tupgsUnlocked[3]=true;changeDisplay("add_layer_button",true)}
}

function changeDisplay(id,show){
    let element = document.getElementById(id)
    if(!show)element.style.display="none"
    else element.style.display="block"
}

function bOU(id){
    return function(){
       buyOverflowUpgrade(id) 
    }
}