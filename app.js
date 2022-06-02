// Import all required modules
require('dotenv').config()
var express = require('express');
var bodyParser = require('body-parser');         // pull information from HTML POST (express4)

// Initialize express app
var port = process.env.PORT || 3000;
var app = express();

// Configure the database
var dbConfig = require('./config/database');
const connectionString = dbConfig.url;
const Menu = require('./models/menu');
const db = new Menu();
db.initialize(connectionString);
app.use(bodyParser.urlencoded({ 'extended': 'true' }));

// Routes
// Add new food document to collection using the body of the request
app.post('/foods', async function (req, res) {
    var newFood = await db.addNewFood(req.body);
    try {
        res.status(201).json({ message: newFood });
    }
    catch (err) {
        res.status(400).json({ error: err });
    }
})

// Get all food objects
app.get('/foods', async function (req, res) {
    var result = await db.getAllFood();
    try {
        if (result.length > 0) {
            res.status(200).json(result);
        }
        else {
            res.status(404).json({
                error: 'There is no food!',
            })
        }
    }
    catch (err) {
        res.status(400).json({ error: `${err}` })
    }
});

// Retrieves food which has a specific id from the database
app.get('/foods/:id', async function (req, res) {
    // Get the id
    let id = req.params.id
    var result = await db.getFoodById(id);

    // Show result or error message
    try {
        if (result) {
            res.status(200).json(result);
        }
        else {
            res.status(404).json({ error: 'There are no food matches with that ID!' });
        }
    }
    catch (err) {
        res.status(400).json({ error: err });
    }
});

// Update/overwrite a food in the database using its id
app.put('/foods/:id', async function (req, res) {
    // Get the id
    let id = req.params.id

    // Update the food by using its id
    var result = await db.updateFoodById(req.body, id);
    try {
        if (result) {
            console.log(res);
            res.status(200).json({ message: result });
        }
        else {
            res.status(404).json({ error: 'There are no food matches with that ID!' });
        }
    }
    catch {
        res.status(400).json({ error: `Error occurred in updating food with id: ${id}, ${error}` });
    }
});

// Delete food from the database using id
app.delete('/foods/:id', async function (req, res) {
    // Get the id
    let id = req.params.id

    // Delete the food
    var result = await db.deleteFoodById(id);
    try {
        if (result) {
            res.status(200).json({ message: result });
        }
        else {
            res.status(404).json({ error: 'There are no food matches with that ID!' });
        }
    }
    catch {
        res.status(400).json({
            error_message: `Error occurred when deleting a food with id: ${id}, ${error}`
        });
    }
});

app.listen(port, () => {
    console.log(`App listening on: ${port}`);
});
