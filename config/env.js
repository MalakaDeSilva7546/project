const env =() =>{
    return{
        https: true,
        buildMode: 'dev',
        backendHostpath:{
            'dev':{
                'server':'glitchfy-backend.herokuapp.com',
                'port': ''
            }
        },
        frontendHostpath:{
            'dev':{
                'server':'localhost',
                'port': '3001'
            }
        }

    }
}
module.exports.tokenSecret=()=>{
    return ('Glitchfy960318')
}
module.exports.backendPath=()=>{
    let enva=env();
    let hostenv= enva.backendHostpath[enva.buildMode];
    let host = hostenv.server;
    let port =hostenv.port;
    return (enva.https?'https':'http')+'://'+host+(port!==''?':'+port:'')
}

module.exports.frontendPath=()=>{
    let enva=env();
    let hostenv= enva.frontendHostpath[enva.buildMode];
    let host = hostenv.server;
    let port =hostenv.port;
    return (enva.https?'https':'http')+'://'+host+':'+port
}

