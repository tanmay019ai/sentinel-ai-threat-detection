const mongoose =require("mongoose");

const Logscheme= new mongoose.Schema({

    ip:
    {
        type:String,
    },
    method:
    {
        type:String,
    },
    url:
    {
        type:String,
    },
    userAgent:
    {
        type:String,
    },
    timestamp:
    {
        type: Date,
        default: Date.now,
    },
    threatDetected:
    {
        type:Boolean,
        default:false,
    },
    threatType:
    {
     type:String,
     default:"None",
    },

});
module.exports=mongoose.model("Log", Logscheme);