const mongoose  = require('mongoose');
require('dotenv').config(); 



mongoose.connect(process.env.MONGODB_URI);



const db = mongoose.connection;

db.on('error', console.error.bind(console, 'connection error: '));
db.once('open',()=>{
    console.log("Connected");
});


//Models
require('./Category.js');
require('./Recipe.js');