const mongoose = require('mongoose')

const mongoURI  = ``;

const connectTomongo =()=>{
    mongoose.connect(process.env.MONGODB_URI,(err)=>{
        if(err) console.log(err);
        else console.log("connected successfully");
    })
}

module.exports=connectTomongo;