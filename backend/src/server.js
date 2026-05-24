require("dotenv").config();

const express =require("express");// EXPRESS LIBRARY
const cors =require("cors");// CORS FOR FRONTEND AND BACKEND
const morgan =require("morgan");// REQUIRE HTTP CONNECTION

const connectdb= require("./config/db.js");
const app=express();//IMPORTING FULL MAIN CENTER

const middleware=require("./middleware/loggermiddleware.js")
const threatmiddleware=require("./middleware/threatmiddleware.js");
const ratemiddleware=require("./middleware/ratemiddleware.js");
const blockmiddleware=require("./middleware/blockipmiddleware.js")
const analyticsRoutes = require("./routes/analyticsroutes.js");
connectdb();

app.use(express.json());
app.use(cors());// USING
app.use(morgan("dev"));
app.use(middleware);
app.use(threatmiddleware);
app.use(ratemiddleware);
app.use(blockmiddleware);
app.get("/", (req, res) =>{
   res.send("Sentinel AI Threat Detection is running");
});

app.use("/api", analyticsRoutes);
const PORT=process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});

app.post("/test", (req, res) => {

    res.json({
        message:"Message received",
        threatDetected: req.threatDetected,
        threatType: req.threatType
    });
});