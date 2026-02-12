const { PORT } = require('./config/index.js');
const express = require('express');
const apiRoutes=require("./routes")
const app = express();
const cors=require("cors")

console.log("MAIN SERVER FILE LOADED");
app.use(cors({
  origin:"http://localhost:5173",
  credentials:true
}))
app.use(express.json());
app.use(express.urlencoded({extended:true}));

app.use("/api",apiRoutes);
app.listen(PORT, async() => {
  console.log(`Server is running on port no ${PORT}`);
  // console.log("hwgdef".length)
});
