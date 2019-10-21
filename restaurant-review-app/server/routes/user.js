
const router = require('express').Router();
let User = require('../models/user.model');
//use express-validator to validate inputs
const { check, validationResult } = require('express-validator');
//use bcrypt to encrypt passwords
const bcrypt = require("bcryptjs");
//use passport to authenticate user when logging in
const passport = require('passport');

//route to fecth all user info from database
router.route('/').get((req, res) => {
  User.find()
    .then(users => res.json(users))
    .catch(err => res.status(400).json('Error: ' + err));
});


//specify id so that it can fetch the unique user
router.route('/:id').get((req, res) => {
  User.findById(req.params.id)
    .then(users => res.json(users))
    .catch(err => res.status(400).json('Error: ' + err));
});


//register
router.route('/register').post([
  //validate user input
    check('firstname').exists(),
    check('lastname').exists(),
    check('email').isEmail(),
    check('password').isLength({min:6}),
    
  ],(req, res) => {

  // Finds the validation errors in this request and wraps them in an object with handy functions
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json({ errors: errors.array() });
  }

  const {firstname,lastname,email,password} = req.body;
 
  const newUser = new User({firstname,lastname,email,password});
  
  //encrypt the password
  bcrypt.genSalt(10, (err,salt) =>{
    bcrypt.hash(newUser.password, salt, (err, hash)=> {
      if(err){
        console.log(err);
      }

      //replace the password with encrpyted one
      newUser.password = hash;

      newUser.save()
      .then(() => res.json({message:'You have registered! Now please sign in.',newUser}))
      .catch(err => res.status(400).json('Error: ' + err));
    })
  });


  
});

// log in 
router.route('/login').post([
  //validate login info
    check('email').exists(),
    check('email').isEmail(),
    check('password').exists()
    
  ],(req,res,next)=>{
  // Finds the validation errors in this request and wraps them in an object with handy functions
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json({ errors: errors.array() });
  }

  passport.authenticate('local', {
    // If this function gets called, authentication was successful.
    // `req.user` contains the authenticated user.
    // failureRedirect: '/login',
    successRedirect: '/dashboard'
  })(req, res, next);
});




//implement delete user account
router.route('/:id').delete( (req, res) => {

  User.findByIdAndDelete(req.params.id)
  .then( ()=> res.json("You deleted your account."))
  .catch( err => res.status(400).json('Err' + err));


});




module.exports = router;