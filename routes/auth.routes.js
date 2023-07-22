
const router = require('express').Router()

const bcryptjs = require('bcryptjs')
const User = require('../models/User.model')
const mongoose = require('mongoose')
const {isLoggedIn,isLoggedOut} = require('../middleware/route-guard')
const saltRounds = 10

router.get('/signup',isLoggedOut,(req,res)=>{
    res.render('auth/signup')
})

router.post('/signup',(req,res)=>{
    const {email,password} = req.body
//1. generate the salt
//2. hash the password using the salt and password
//3. create the user with the hashedPassword

    // VALIDATION: Checking if the email and password are properly filled in
    if(email === '' || password===''){
        res.render('auth/signup',{errorMessage:"Please fill in all mandatory fields. either password or email are incomplete"})
        return
    }

    //VALIDATION 4: Checking if the password is strong enough for my user
    const regex = /(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{6,}/;
    if (!regex.test(password)) {
        res
          .status(500)
          .render('auth/signup', { errorMessage: 'Password needs to have at least 6 chars and must contain at least one number, one lowercase and one uppercase letter.' });
        return;
      }
    

    //generate the salt
    bcryptjs.genSalt(saltRounds)
    .then((salt)=>{
        //generating the hashed (encrypted) password
       return bcryptjs.hash(password,salt)
    })
    .then(passwordHash=>{
        console.log("Hashed Password: ", passwordHash)
       return User.create({email,passwordHash})
    })
    .then((user)=>{
        req.session.currentUser = user
        res.redirect('/userProfile')
    })
    .catch(err=>{
        console.log(err)
        //VALIDATION 2: checking if any of my mongoose validators have not been met
        if (err instanceof mongoose.Error.ValidationError) {
            res.render('auth/signup', { errorMessage: err.message });
        }
        //VALIDATION 3: Checking if the email is already registered in my website
        else if(err.code === 11000){
            res.render('auth/signup',{errorMessage:"Email is already registered. Please use a different email or login"})
        }
    })

    

    //encrypting the password
    //using bcrypt we will encrypt the user password
})

router.get('/login',isLoggedOut,(req,res)=>{
    console.log(req.session.currentUser)
    res.render('auth/login')
})

router.post('/login',(req,res)=>{
    const {email,password} = req.body

    console.log("SESSION is: ", req.session)

    //checking if the user input thier email and password in the request
    if (email === '' || password === '') {
        res.render('auth/login', {
          errorMessage: 'Please enter both, email and password to login.'
        });
        return;
      }
      //findOne finds the document that has the email that the user put in the form
      //the email from the req.body that we destructured
    User.findOne({email})
    .then(user=>{
        // Checking if there is no user with the email inputted in our database
        if(user === null){
            res.render('auth/login',{errorMessage:"Email not registered with website, please sign up"})
            return
        }
        //checking the inputted password agaianst the hashed password in the database
        else if(bcryptjs.compareSync(password,user.passwordHash)){
            // res.render('users/user-profile',user)
            const {email,_id} = user
            req.session.currentUser = {email,_id}
            // console.log(req.session)
            res.redirect('/userProfile')
        }
        //if the password is incorrect we render the login route again with a custom error message
        else{
            res.render('auth/login',{errorMessage:"Password Incorrect"})
        }

    })
})


router.get('/userProfile',isLoggedIn,(req,res)=>{

    console.log(req.session.currentUser)
    res.render('users/user-profile')
})

router.post("/logout",(req,res)=>{
    req.session.destroy()
    req.app.locals.signedInUser=null
    res.redirect('/login')
})

module.exports = router