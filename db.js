const mongoose = require('mongoose')

const mongoURI  = `mongodb+srv://${process.env.MONGO_USER}:${process.env.MONGO_PASSWD}@cluster0.13iaa4q.mongodb.net/reunion?retryWrites=true&w=majority`;

const connectTomongo =()=>{
    mongoose.connect(mongoURI,(err)=>{
        if(err) console.log(err);
        else console.log("connected successfully");
    })
}

module.exports=connectTomongo;