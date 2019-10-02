exports.twitter = (req, res) => {
    const io = req.app.get('io')
    const user = { 
      name: req.user.username,
      photo: req.user.photos[0].value.replace(/_normal/, '')
    }
    io.in(req.session.socketId).emit('twitter', user)
  }
  
  exports.google = (req, res) => {
    const io = req.app.get('io')
    console.log(req.user.name+" "+req.session.socketId)
    // const user = { 
    //   name: req.user.name,
    //   photo: req.user.photo
    // }
    io.in(req.session.socketId).emit('google', req.user)
    return res.sendStatus(200)
  }
  
  exports.facebook = (req, res) => {
    const io = req.app.get('io')
    console.log(req.user.name+" "+req.session.socketId)
    //const { givenName, familyName } = req.user.name
    const user = { 
      name: req.user.name,
      photo: req.user.photo
    }
    io.in(req.session.socketId).emit('facebook', req.user)
    return res.sendStatus(200)
  }
  
  exports.github = (req, res) => {
    const io = req.app.get('io')
    console.log(req.user.name+" "+req.session.socketId)
    // const user = { 
    //   name: req.user.username,
    //   photo: req.user.photos[0].value
    // }
    io.in(req.session.socketId).emit('github', req.user)
    return res.sendStatus(200)
  } 