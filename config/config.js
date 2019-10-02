var env =require('./env')
module.exports.config={
    facebookAuth:{
        clientID:'2320730924862793',
        clientSecret:'eae09b6576d9ed59a65ca292fe24f82f',
        callbackURL:env.backendPath()+'/auth/facebook/callback'
    },
    FACEBOOK_CONFIG:{
        clientID:'2320730924862793',
        clientSecret:'eae09b6576d9ed59a65ca292fe24f82f',
        callbackURL:env.backendPath()+'/auth/facebook/callback'
    }
}

module.exports.FACEBOOK_CONFIG={
    clientID:'2320730924862793',
    clientSecret:'eae09b6576d9ed59a65ca292fe24f82f',
    callbackURL:env.backendPath()+'/auth/facebook/callback'
}

module.exports.GOOGLE_CONFIG={
    clientID:'289027886155-98366dhf47mehmg2ovg5c0tosib5j3rc.apps.googleusercontent.com',
    clientSecret:'QQdBTmW9dwLo36T1E8JphuWi',
    callbackURL:env.backendPath()+'/auth/google/callback'
}

module.exports.GITHUB_CONFIG={
    clientID:'113753262a3ee37714c9',
    clientSecret:'b46f7476d834344c8e054f993ae8085df64228fb',
    callbackURL:env.backendPath()+'/auth/github/callback'
}