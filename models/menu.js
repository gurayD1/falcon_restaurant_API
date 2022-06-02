// Load mongoose since we need it to define a model
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

// Create restaurant schema
MenuSchema = new Schema({
    food_id: String,
    food_name: String,
    price: String,
    description: String,
    category: String,
    active: String,
    image: String
}, { collection: 'foods' });

MenuSchema.set('versionKey', false);

class Menu {

    // Create initialize method in menu database class
    async initialize(connectionString) {

        try {
            // Connect to the atlas database
            await mongoose.connect(connectionString);
            this.Menu = mongoose.model('Menu', MenuSchema);
            return true;
        } catch (err) {
            console.log(`Could not connect to atlas server, error: '${err}'`);
            return false;
        }
    }

    // Add a new document in foods collection using data passed
    async addNewFood(data) {
        // Create a new menu object with the data inserted
        var menuNew = new this.Menu(data);

        // Save to the database
        await menuNew.save();

        // Show success message
        return `${menuNew._id} saved successfully!`;
    }

    // Get all food from database depending on user input
    getAllFood() {
        return this.Menu.find();
    }

    // Get food by its id from the database
    getFoodById(id) {
        // Check if it is a valid object ID that the user enters
        if (mongoose.isValidObjectId(id)) {
            var result = this.Menu.findOne({ _id: id }).lean().exec();
        }
        // Return result or error message
        if (result != null) {
            return result;
        }
        else {
            return 'No results found';
        }
    }


    // Get food by its id from the database
    getFoodByFoodId(id) {
        var result = this.Menu.findOne({ food_id: id }).lean();

        // Return result or error message
        if (result != null) {
            return result;
        }
    }

    // Update food by using its id
    async updateFoodById(data, id) {
        // $set replaces each field with the data
        if (mongoose.isValidObjectId(id)) {
            var result = this.Menu.updateOne({ _id: id }, { $set: data }).lean().exec();
        }
        if (result != null) {
            return `Successful in updating food ${id}!`;
        }
        else {
            return 'No results found';
        }
    }

    // Deletes food by using its id
    async deleteFoodById(id) {
        // Checks if the id is a valid object id then deletes it from the database
        if (mongoose.isValidObjectId(id)) {
            var result = this.Menu.deleteOne({ _id: id }).lean().exec();
        }

        if (result != null) {
            return `Successful in deleting food ${id}!`;
        }
        else {
            return 'No results found';
        }
    }
}

// Export the class
module.exports = Menu;