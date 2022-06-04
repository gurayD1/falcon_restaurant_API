// Load mongoose since we need it to define a model
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

// Create restaurant schema
UserSchema = new Schema({
    email: String,
    password: String

}, { collection: 'users' });

UserSchema.set('versionKey', false);

class User {

    changeModel(){
        this.User = mongoose.model('User', UserSchema);
    }


    // Create initialize method in menu database class
    async initialize(connectionString) {
        try {
            // Connect to the atlas database
            await mongoose.connect(connectionString);
            this.User = mongoose.model('User', UserSchema);
            return true;
        } catch (err) {
            console.log(`Could not connect to atlas server, error: '${err}'`);
            return false;
        }
    }

    // Add a new document in foods collection using data passed
    async addNewUser(data) {
        // Create a new menu object with the data inserted
        var userNew = new this.User(data);

        // Save to the database
        await userNew.save();

        // Show success message
        return `${userNew._id} saved successfully!`;
    }

    // Get all food from database depending on user input
    getAllUsers() {
        return this.User.find();
    }

    // Get food by its id from the database
    getUserById(id) {
        // Check if it is a valid object ID that the user enters
        if (mongoose.isValidObjectId(id)) {
            var result = this.User.findOne({ _id: id }).lean().exec();
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
      getUserByUserEmail(email1) {
      
        return this.User.findOne({ email: email1 }).lean().exec();
    }

    // Update food by using its id
    async updateUserById(data, id) {
        // $set replaces each field with the data
        if (mongoose.isValidObjectId(id)) {
            var result = this.User.updateOne({ _id: id }, { $set: data }).lean().exec();
        }
        if (result != null) {
            return `Successful in updating user ${id}!`;
        }
        else {
            return 'No results found';
        }
    }

    // Deletes food by using its id
    async deleteUserById(id) {
        // Checks if the id is a valid object id then deletes it from the database
        if (mongoose.isValidObjectId(id)) {
            var result = this.User.deleteOne({ _id: id }).lean().exec();
        }

        if (result != null) {
            return `Successful in deleting user ${id}!`;
        }
        else {
            return 'No results found';
        }
    }
}

// Export the class
module.exports = User;