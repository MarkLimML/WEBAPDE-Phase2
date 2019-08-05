const express = require("express")
const bodyparser = require("body-parser")
const hbs = require("hbs")
const session = require("express-session")
const cookieparser = require("cookie-parser")
const mongoose = require("mongoose")

const {User} = require("./user.js")
const {Question} = require("./question.js")

const app = express()

mongoose.Promise = global.Promise
mongoose.connect("mongodb://localhost:27017/userss19", {
    useNewUrlParser : true
})

const urlencoder = bodyparser.urlencoded({
    extended: false
})

app.use(express.static(__dirname + "/public"))
app.use(session({
    secret : "secret name",
    name : "session",
    resave : true,
    saveUninitialized : true,
    cookie : {
        maxAge : 1000*60*60*24*365
    }
}))
app.use(cookieparser())

app.get("/", (req,res)=>{
    /*if(req.session.view) {
        req.session.view++
    }
    else {
        req.session.view = 1
    }
    res.send("Views "+req.session.view)
    
    if(req.session.username){
        res.render("home.hbs",{
            username: req.session.username
        })
    }
    else{
        res.sendFile(__dirname + "/public/login.html")
    }*/
    let fs = 12
    if(req.cookies["font size"]) {
        fs = req.cookies["font size"]
    }
    
    if(req.session.username){
        console.log(req.session.username)
        res.render("index.hbs",{
            username: req.session.username
        })
    }
    else{
        console.log(User)
        res.sendFile(__dirname + "/views/index.html")
    }
    
})

app.get("/login.html", (req,res)=>{
    res.sendFile(__dirname + "/views/login.html")
})

app.post("/login", urlencoder,(req,res)=>{
    let username = req.body.login_username
    let password = req.body.login_password
    
    User.findOne({
        username: username,
        password: password
    }, (err, doc)=>{
        if(err){
            res.send(err)
        }else if(!doc){
            res.send("User does not exist")
        }else{
            console.log(doc)
            req.session.username = doc.username
            res.redirect("/")
        }
    })
})

app.post("/register", urlencoder,(req,res)=>{
    let username = req.body.un
    let password = req.body.pw
    
    let user = new User({
        /*username: username,
        password: password*/
        username,
        password
    })
    
    user.save().then((doc)=>{
        // if operation succeed
        console.log(doc)
        req.session.username = doc.username
        res.redirect("/")
    }, ()=>{
        // if operation fails
        res.send(err)
    })
})

app.get("/users", (req,res)=>{
    //load all users
    //localhost:3000/users
    console.log("GET /users")
    User.find({}, (err,docs)=>{
        if(err){
            res.send(err)
        }else{
            res.render("admin.hbs",{
                users:docs
            })
        }
    })
})

app.get("/edit", (req,res)=>{
    //retrieve user to edit using id
    console.log("GET /edit")
    User.findOne({
        _id: req.query.id
    }, (err,doc)=>{
        if(err){
            res.send(err)
        }else{
            res.render("edit.hbs", {
                user: doc
            })
        }
    })
})

app.get("/addpage", (req,res)=>{
    console.log("GET /addpage")
    res.render("add.hbs")
})

app.post("/add", urlencoder, (req,res)=>{
    console.log("POST /add")
    let username = req.body.un
    let password = req.body.pw
    
    let user = new User({
        username,password
    })
    
    user.save().then((doc)=>{
        console.log("Added user")
        res.redirect("/users")
    }, (err)=>{
        res.send(err)
    })
})

app.post("/delete", urlencoder, (req,res)=>{
    console.log("POST /delete")
    Question.deleteOne({
        _id: req.body.id
    }, (err,doc)=>{
        if(err){
            res.send(err)
        }else{
            res.redirect("/users")
        }
    })
})

app.post("/update", urlencoder, (req,res)=>{
    console.log("POST /update")
    User.update({
        _id: req.body.id
    }, {
        username: req.body.un,
        password: req.body.pw
    }, (err,doc)=>{
        if(err){
            res.send(err)
        }else{
            res.redirect("/users")
        }
    })
})

app.post("/preferences", urlencoder,(req,res)=>{
    let fs = req.body.fontsize
    res.cookie("font size", fs,{
        maxAge: 10000*60*60*24*365
    })
    res.redirect("/")
})

app.listen(3000, ()=>{
    console.log("Live at port 3000")
})