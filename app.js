const express = require("express")
const bodyparser = require("body-parser")
const hbs = require("hbs")
const session = require("express-session")
const cookieparser = require("cookie-parser")
const mongoose = require("mongoose")

const {User} = require("./models/user.js")
const {Question} = require("./models/question.js")

const app = express()

var publicDir = require('path').join(__dirname,'/public')
var modelsDir = require('path').join(__dirname,'/models')
app.use(express.static(publicDir))
app.use(express.static(modelsDir))

var uri = 'mongodb+srv://test:1234@cluster0-u8a7m.mongodb.net/test?retryWrites=true&w=majority';

mongoose.Promise = global.Promise
mongoose.connect(uri, {
    useNewUrlParser : true,
    dbName: "userss19"
})

const urlencoder = bodyparser.urlencoded({
    extended: false
})

app.set("view engine","hbs")
app.use(express.static(__dirname + "/public"))
app.use(session({
    secret : "secret name",
    name : "session",
    resave : false,
    rolling: true,
    saveUninitialized : true,
    cookie : {
        secure: false,
        maxAge : 1000*60*60*24*365
    }
}))
app.use(cookieparser())

app.get(["/","/index.html"], (req,res)=>{
    
    if(req.session.username){
        console.log(req.session.username)
        Question.find({}, (err, doc)=>{
            if(err){
                res.send(err)
            }else if(!doc){
                res.send("No questions available")
            }else{
                console.log("English loaded")
                res.render("index.hbs",{
                    username: req.session.username,
                    questions: doc
                })
            }
        })
        
    }
    else{
        console.log(User)
        console.log(Question)
        //res.render("index.hbs",{
        //    username: "Guest"
        //})
        res.sendFile(__dirname + "/views/index.html")
    }
    
})

app.get("/login.html", (req,res)=>{
    res.sendFile(__dirname + "/views/login.html")
})

app.get("/signup.html", (req,res)=>{
    res.sendFile(__dirname + "/views/signup.html")
})


app.get("/math", (req,res)=>{
    if(req.session.username){
        Question.find({}, (err, doc)=>{
            if(err){
                res.send(err)
            }else if(!doc){
                res.send("No questions available")
            }else{
                console.log("Math loaded")
                res.render("math.hbs",{
                    username: req.session.username,
                    questions: doc
                })
            }
        })
    }
    else{
        res.sendFile(__dirname + "/views/math.html")
    }
})

app.get("/english", (req,res)=>{
    res.redirect("/")
})

app.get("/science", (req,res)=>{
    if(req.session.username){
        Question.find({}, (err, doc)=>{
            if(err){
                res.send(err)
            }else if(!doc){
                res.send("No questions available")
            }else{
                console.log("Science loaded")
                res.render("science.hbs",{
                    username: req.session.username,
                    questions: doc
                })
            }
        })
    }
    else{
        res.sendFile(__dirname + "/views/science.html")
    }
})

app.post("/scoreup", (req,res)=>{
    User.updateOne({
        _id: req.session._id
    }, {
        totalgrains: req.session.totalgrains + 10
    }, (err,doc)=>{
        if(err){
            res.send(err)
        }else{
            console.log(req.session.totalgrains)
            console.log("Updated")
            var newgrains = req.session.totalgrains + 10
            req.session.totalgrains = newgrains
        }
    })
    User.findOne({
        username: req.session.username
    }, (err,doc)=>{
        if(err){
            res.send(err)
        }else{
            console.log("Found One")
            console.log(doc)
            req.session.username = doc.username
            req.session.password = doc.password
            req.session.totalgrains = doc.totalgrains
            console.log(req.session.totalgrains)
            req.session.save()
        }
    })
})

app.get("/editprofile.html", (req,res)=>{
    if(req.session.username){
        User.findOne({
            username: req.session.username
        }, (err,doc)=>{
            if(err){
                res.send(err)
            }else{
                console.log("Found One")
                console.log(req.session)
                console.log(doc)
                res.render("editprofile.hbs",{
                    username: doc.username,
                    password: doc.password,
                    totalgrains: doc.totalgrains
                })
            }
        })
        
    }
    else{
        res.redirect("/")
    }
})

app.get("/uploadquestion.html",(req,res)=>{
    if(req.session.username){
        res.render("uploadquestion.hbs",{
            username: req.session.username
        })
    }
    else{
        res.redirect("/")
    }
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
            req.session._id = doc._id
            req.session.username = doc.username
            req.session.password = doc.password
            req.session.totalgrains = doc.totalgrains
            res.redirect("/")
        }
    })
})

app.get("/logout", urlencoder,(req,res)=>{
    req.session.username = ""
    req.session.password = ""
    res.redirect("/")
})

app.post("/register", urlencoder,(req,res)=>{
    let username = req.body.reg_username
    let password = req.body.reg_password
    
    let user = new User({
        /*username: username,
        password: password*/
        type: "user",
        username: username,
        password: password,
        totalgrains: 0
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

app.post("/changepass", urlencoder, (req,res)=>{
    console.log("POST /changepass")
    User.update({
        _id: req.session._id
    }, {
        username: req.body.un,
        password: req.body.changepass
    }, (err,doc)=>{
        if(err){
            res.send(err)
        }else{
            req.session.username = req.body.un
            req.session.password = req.body.changepass
            res.redirect("/")
        }
    })
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

app.post("/addquestion", urlencoder, (req,res)=>{
    console.log("POST /addquestion")
    let category = req.body.category
    let stmt = req.body.stmt
    let choices = [req.body.c1,req.body.c2,req.body.c3,req.body.c4]
    let correct = req.body.ans - 1
    
    let question = new Question({
        category: category,
        question: stmt,
        choices: choices,
        correctans: correct
    })
    
    question.save().then((doc)=>{
        console.log("Added question")
        console.log(doc)
        res.render("uploadquestion.hbs",{
            username: req.session.username
        })
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

app.listen(process.env.PORT || 3000, ()=>{
    console.log("Live at port "+process.env.PORT)
})

hbs.registerHelper('whenequal', function(v1, v2, options) {
    if(v1==v2) {
      return options.fn(this);
    }
});