require("dotenv").config();

const express =require("express");// EXPRESS LIBRARY
const cors =require("cors");// CORS FOR FRONTEND AND BACKEND
const morgan =require("morgan");// REQUIRE HTTP CONNECTION

const connectdb= require("./config/db.js");
const app=express();//IMPORTING FULL MAIN CENTER

connectdb();

app.use(cors());// USING
app.use(morgan("dev"));
app.use(express.json());

app.get("/", (req, res) =>{
   res.send("Sentinel AI Threat Detection is running");
});

const PORT=process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});