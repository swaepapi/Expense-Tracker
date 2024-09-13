const { Sequelize } = require('sequelize');
const express = require('express');
const app = express();


app.set('view engine', 'ejs');
app.use(express.urlencoded({extended: true}));
app.use(express.json());
app.use(express.static('public'));


const sequelize = new Sequelize('database_development', 'root', 'SQL@swaepapi24', {
    host : 'localhost',
    dialect:'mysql'

});


async function connect(){
    try {
    await sequelize.authenticate();
    console.log('Connection established Successfully.');
        } catch (error){
    console.log('Unable to connect to the database.', error);
        }
}

connect();

// app.get ('/', (req, res) =>{
//     res.send('Hello Fidel, you are Making Progress. Keep it up') ;

// });

app.get ('/signup', (req, res) =>{
    res.render('signup',{ title: 'Sign up' } );

});
app.get ('/login', (req, res) =>{
    res.render('login',{ title: 'Log in' } );

});
app.get ('/dashboard', (req, res) =>{
    res.render('dashboard',{ title: 'Dashboard' } );

});

app.post('/signup', async (req, res) =>{
    const { name, email, password} = req.body;
    const user = User.await.create({ name:name, email: email, password: password});
    res.send(user);
});


app.listen(8000, () =>{
console.log('App is running on port 8000');
}

);