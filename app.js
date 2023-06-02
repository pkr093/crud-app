require('dotenv').config();
const express = require('express')
const path = require('path');
const app = express();
var mongoose = require('mongoose');

mongoose.connect(process.env.DATABASE, { useNewUrlParser: true })
   .then(()=>{
    console.log('db conneted')
   });
//    mongodb://127.0.0.1:27017/loginPage
const PORT = process.env.PORT || 8000;

//define mongoose schema
var contactSchema = new mongoose.Schema(
    {
        name: String, address: String, number: String, mail: String
    }
);
var Contact = mongoose.model('Contact', contactSchema);


app.use('/static', express.static('static'));
app.use(express.urlencoded());
app.set('view engine', 'pug');
app.set('views', path.join(__dirname, 'views'));

// Endpoint
// app.get("/",(req,res)=>{
//     params={ };
//     res.render('index.pug',params);
// })

const userSchema = new mongoose.Schema({
    username: String,
    password: String
})

const User = mongoose.model('User', userSchema);
let valid = false;

function isAuthenticated(req, res, next) {
    if (valid) {
        return next();
    }
    return res.redirect('/');
}

app.get("/", (req, res) => {
    if (valid) {
        return res.redirect('/home');
    }
    res.render('login.pug');
})

app.post("/login", (req, res) => {
    const { username, password } = req.body;

    User.findOne({ username })
        .then((user) => {
            if (!user) {
                return res.status(500).json({ error: 'Invalid username' })
            }
            if (password === user.password) {

                valid = true;
                return res.status(210).redirect('/home');
            }
            else {
                // return res.status(401).redirect('/');
                return res.status(401).json({ error: 'password not found' });
            }
        })
        .catch((error) => {
            console.error('login error', error);
            return res.status(500).json({ error: 'Invalid Login' })
        })
})



app.get("/home", isAuthenticated, (req, res) => {
    params = {};
    res.render('home.pug', params);
})



app.get("/contact", isAuthenticated, (req, res) => {
    params = {};
    res.render('contact.pug', params);
})


app.post("/contact", (req, res) => {
    var myData = new Contact(req.body);
    //save return promises so use 'then and catch' after it.
    myData.save().then(() => {
        valid = false;
        res.redirect('/');
    }).catch(() => {
        res.status(400).send("form is not saved");
    });

})

app.listen(PORT, () => {
    console.log(`app is running at ${PORT}`);
})