const router = require('express').Router()
const jwt = require('jsonwebtoken')
const fs = require('fs')


//services
const users = require('../services/userMangement.js');
const tracks = require('../services/trackMangement.js');

router.get("/", (req, res) => {
    res.status(200).send("Api UP")
});

  //Unprotected (public) routes
  router.post("/signup", async (req,res) =>{
      if(typeof req.body.username == "string" && typeof req.body.password == "string" && typeof req.body.name == "string"){
        //Action here
       res.json( await users.create(req.body.username,req.body.password,req.body.name))
      }else{
          res.json({success: false,error:"Invalid api call"})
      }
  });

  router.post("/login", async (req,res) =>{
    if(typeof req.body.username !== "undefined" && typeof req.body.password !== "undefined"){
         //Action here
      res.json( await users.login(req.body.username,req.body.password))
    }else{
      res.json({success: false,error:"Invalid api call"})
    }
  });

//Protected (user) routes

router.post("/getUser", verifyToken, async (req,res) =>{
  if(typeof req.user.username == "string"){
       //Action here
    res.json( await users.get(req.user.username))
  }else{
    res.json({success: false,error:"Invalid api call"})
  }
});


router.post("/createTrack", verifyToken, async (req,res) =>{
  if(typeof req.body.trackData == "object"){
       //Action here
    res.json( await tracks.create(req.user.id,req.body.trackData))
  }else{
    res.json({success: false,error:"Invalid api call"})
  }
});

router.post("/getTrackInfo", verifyToken, async (req,res) =>{
  if(typeof req.body.trackID == "string"){
       //Action here
    res.json( await tracks.getInfo(req.body.trackID))
  }else{
    res.json({success: false,error:"Invalid api call"})
  }
});


router.post("/getAllTrackInfo", verifyToken, async (req,res) =>{
  if(typeof req.body.trackID == "string"){
       //Action here
    res.json( await tracks.getInfo(req.body.trackID,req.user.id))
  }else{
    res.json({success: false,error:"Invalid api call"})
  }
});



router.post("/editTrack", verifyToken, async (req,res) =>{
  if(typeof req.body.trackID == "string" && req.body.newData == "object"){
       //Action here
    res.json( await tracks.edit(req.body.trackID,req.user.id,req.body.newData))
  }else{
    res.json({success: false,error:"Invalid api call"})
  }
});


//Middlewares ==============

//Verify token
function verifyToken(req,res,next){
    //Get token
    const bearHeader = req.headers['authorization']
    //Check if they supplied a token
    if(typeof bearHeader !== "undefined"){
          const token = bearHeader.split(' ')[1]
          req.token = token
          //Verify token
          jwt.verify(req.token, process.env.SECERT, function(err, decoded) {
            if (err) {
    
              switch (err.name) {
                case "TokenExpiredError":
                  res.json({success:false,error:"Login expired", errorType:"token"})
                  break;

                default:
                  res.json({success:false,error:"Error in token", errorType:"token"})
                  break;

              }
          
            }else{ //Take data from token and put in req
         
              req.user = decoded
              next();

            }
          });
    }else{
        res.json({success:false,error:"Token was not supplied"})
    }

}

  module.exports = router;