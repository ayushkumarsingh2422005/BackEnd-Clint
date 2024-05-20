import express from "express";

const app = express();

app.get('/', (req, res)=>{
    res.json({"ayush": "kumar singh"});
});

const PORT = 3000;
app.listen(PORT, ()=>{
    console.log(`Server running at port ${PORT}`);
});