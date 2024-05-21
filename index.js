import express from "express";
import items from './Routes/items.js'
// import db from "./db.js"; // Ensure the correct file extension
// connectToMongoose();
const app = express();


// middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Defining routes
app.use('/api/order', items);

app.get('/', (req, res) => {
    res.json({"ayush": "kumar singh"});
});

// Starting server
const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Server running at port ${PORT}`);
});
