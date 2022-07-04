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
      await  mongoose.connection.close();
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

       let isIdAvailable = await this.Menu.findOne({ food_id: menuNew.food_id }) ? false : true

        if(isIdAvailable){
          //  console.log("available")
          //  console.log(menuNew)

        }else{
          //  console.log("is not available")
            var lastId = { food_id: '' }
            lastId = await this.Menu.find({},{ food_id: 1, _id:0 }).sort({_id:-1}).limit(1)

            var newId = parseInt(lastId[0].food_id)
            newId += 1
            //console.log(newId)
            menuNew.food_id = newId
            //console.log(menuNew)
        }
        
        // Save to the database
        await menuNew.save();

        // Show success message
        return `${menuNew._id} saved successfully!`;
    }

        // // Add a new document in foods collection using data passed
        // async addNewFood2(data) {
         
            
        // // var lastID = await  this.Menu.aggregate([
        // //         { $addFields: { lastElem: { $last: "" } } }
        // //      ])
        //     var lastId = { food_id: '25' }
        //     lastId = await   this.Menu.find({},{ food_id: 1, _id:0 }).sort({_id:-1}).limit(1)
        //     console.log(lastId[0].food_id)
    
        //     // Show success message
        //     return `${lastId.food_id} last id!`;
        // }

    // Get all food from database depending on user input
    getAllFood() {
        return this.Menu.find();
    }

    // Get food by its id from the database
    getFoodById(id) {
        var result = this.Menu.findOne({ food_id: id }).lean().exec();
        // Return result or error message
        if (result != null) {
            return result;
        }
        else {
            return 'No results found';
        }
    }

    // Update food by using its id
    async updateFoodById(data, id) {
        // $set replaces each field with the data
        var result = this.Menu.updateOne({ food_id: id }, { $set: data }).lean().exec();
        if (result != null) {
            return `Successful in updating food ${id}!`;
        }
        else {
            return 'No results found';
        }
    }

    // Deletes food by using its id
    async deleteFoodById(id) {
        // Delete food from the database
        var result = this.Menu.deleteOne({ food_id: id }).lean().exec();

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