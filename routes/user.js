var express = require('express');
var router = express.Router();
const bcrypt = require('bcryptjs');
const secret = require('../config/secret').secret;
var jwt = require('jsonwebtoken');
const fetchUser = require('../middleware/user');
//used for validation
const { body, validationResult } = require('express-validator');

//to use the model, we need to import the model as wel
var User = require("../models/user");

// Complete route: /product_admin
router.get('/', function(req, res, next) {
    console.log(req.body)
    res.statusCode = 200;
    res.setHeader('Content-Type', 'application/json');
    res.json({success: true});
});

//save func can be used to create an entry, user = User, both should be diff can;t use same name
router.post('/', [
    body('name','Enter a valid name').isLength({ min: 3 }),
    body('email','Enter a valid mail').isEmail(),
    body('password','len of password >=3').isLength({ min: 5 }),
],async function(req, res, next) {
    
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    const salt = await bcrypt.genSalt(10);
    const secPass = await bcrypt.hash(req.body.password, salt);


    User.create({'name': req.body.name, 'password': secPass, 'email': req.body.email })
    .then((user) => {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json({user, success: true, err: ""});
        console.log(user)
    })
    .catch(err => {
        res.statusCode = 500;
        res.setHeader('Content-Type', 'application/json');
        res.json({success: false, err: err});
    });

})
//to verify that email and passwor dis correct
router.post('/login', [
    body('email','Enter a valid mail').isEmail(),
    body('password','password cannot be empty').exists(),
],async function(req, res, next) {
    console.log(req.body);
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    const {email, password } = req.body;
    let user = await User.findOne({email});
    console.log(user);

    if(!user){
        return res.status(400).json({ error: "user doesn't exist" });
    }

    //if user exists, let's create password
    try{
        const passwordCompare = await bcrypt.compare(password, user.password);
        if(!passwordCompare){
            return res.status(400).json({ error: "incorrect password" });
        }
        
        //now let's generate jwt token with payload as user id and secret
        const data = {
            user:{
                id: user.id
            }
        }
        console.log(user.id);
        const authToken = jwt.sign(data, secret);
        res.send({success:true , authToken});
    } catch(error){
        console.log(error);
        res.status(500).send({success:true,error:"internal server error"})
    }   

})

//to get info about logged in user
router.post('/getUser', fetchUser ,async function(req, res, next) {
    
    //assuming if we get inside, it means header had valid token 
    //and req has user id

    try{
        const userId = req.user.id;
        //we are finding by id else we would have passes userid as {userId} and select will give
        //us everything except password
        const user = await User.findById(userId).select("-password");
        res.send(user);
    }catch(error){
        console.log(error);
        res.status(500).send("internal server error")
    }

})

module.exports = router;