const express = require('express');
const app = express();
const mongoose = require('mongoose');
const Registeruser = require('./model');
const jwt = require('jsonwebtoken');
const middleware = require("./middleware");
const cors = require("cors");

mongoose.connect("mongodb+srv://nandyalapavan036:pavankumar@cluster0.epybgzc.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0").then(
  () => console.log('DB Connection established')
);

app.use(express.json());
app.use(cors({origin:"*"}))

app.post('/register', async(req,res)=>{
  try{

    const {username,email,password,confirmpassword} = req.body;
    let exits = await Registeruser.findOne({email});

    if(exits){
      return res.status(400).send("User Already Exits")
    }
    if(password !== confirmpassword){
      return res.status(400).send("passwords are not matching")
    };

    let newUser = new Registeruser({
      username,
      email,
      password,
      confirmpassword
    });
    await newUser.save();
    res.status(200).send("Register sucessfully");


  }
  catch(err){
    console.log(err)
    return res.status(500).send("Internal Server Error");

  }

})

app.get('/',(req,res)=>{
  res.send('hello world')
})


app.post('/login',async(req,res)=>{
  try{
    const{email,password} = req.body;
    let exits = await Registeruser.findOne({email});

    if(!exits){
      return res.status(400).send("User Not Found");
    }
    if(exits.password !== password){
      return res.status(400).send("Invalid Credentials");
    }
    let payload = {
      user:{
        id : exits.id
      }
    }

    jwt.sign(payload,'jwtSecret',{expiresIn:3600000},
      (err,token) =>{
        if (err) throw err;
        return res.json({token});
      }

    )

  }
  catch(err){
    console.log(err);
    return res.status(500).send('Server Error');
  }
})

app.get('/myprofile',middleware,async(req,res)=>{
  try{
    let exits = await Registeruser.findById(req.user.id);
    if(!exits){
      return res.status(400).send("User Not Found");
    }
    res.json(exits);

  }
  catch(err){
    console.log(err);
    return res.status(500).send("Server Error");
  }
})

app.listen(5000,()=>{
  console.log("Server running...")
})