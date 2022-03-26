const secret = require('../config/secret').secret;
var jwt = require('jsonwebtoken');

const fetchUser = (req,res,next)=>{
    //token will be a part of header
    const token = req.header('auth-token');
    if(!token){
        res.status(401).send({error: "token is not present"})
    }

    try{
        //i'll get the payload which is the user id
        const data = jwt.verify(token, secret);
        //creating a field in req
        req.user = data.user;
        //calling next func
        next();
    }catch(error){
        res.status(401).send({error: "token is not valid"})
    }
}
module.exports = fetchUser;