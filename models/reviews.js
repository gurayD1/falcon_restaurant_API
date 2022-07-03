// Load mongoose since we need it to define a model
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

// Create restaurant schema
ReviewsSchema = new Schema({
    name: String,
    rating: String,
    review: String,
    id: String
}, { collection: 'reviews' });


ReviewsSchema.set('versionKey', false);

class Reviews {
   
    // Create initialize method in menu database class
    async initialize(connectionString) {
      await  mongoose.connection.close();
        try {
            // Connect to the atlas database
            await mongoose.connect(connectionString);
            this.Reviews = mongoose.model('Reviews', ReviewSchema);
            return true;
        } catch (err) {
            console.log(`Could not connect to atlas server, error: '${err}'`);
            return false;
        }
    }

    // Get all food from database depending on user input
    getAllReviews() {
        return this.Reviews.find();
    }

    // Get food by its id from the database
    getReviewById(id) {
        var result = this.Reviews.findOne({ id: id }).lean().exec();
        // Return result or error message
        if (result != null) {
            return result;
        }
        else {
            return 'No results found';
        }
    }

    // Deletes food by using its id
    async deleteReviewById(id) {
        // Delete food from the database
        var result = this.Reviews.deleteOne({ id: id }).lean().exec();

        if (result != null) {
            return `Successful in deleting food ${id}!`;
        }
        else {
            return 'No results found';
        }
    }
}

// Export the class
module.exports = Reviews;