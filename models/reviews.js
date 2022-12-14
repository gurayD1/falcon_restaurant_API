// Load mongoose since we need it to define a model
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

// Create restaurant schema
ReviewsSchema = new Schema({
    name: String,
    rating: String,
    review: String
}, { collection: 'reviews' });


ReviewsSchema.set('versionKey', false);

class Reviews {

    // Create initialize method in menu database class
    async initialize(connectionString) {
        await mongoose.connection.close();
        try {
            // Connect to the atlas database
            await mongoose.connect(connectionString);
            this.Reviews = mongoose.model('Reviews', ReviewsSchema);
            return true;
        } catch (err) {
            console.log(`Could not connect to atlas server, error: '${err}'`);
            return false;
        }
    }

    // Get all reviews from database depending on user input
    getAllReviews() {
        return this.Reviews.find();
    }

    // Add a new document in reviews collection using data passed
    async addNewReview(data) {
        // Create a new reviews object with the data inserted
        var reviewsNew = new this.Reviews(data);

        // Save to the database
        await reviewsNew.save();

        // Show success message
        return `${reviewsNew._id} saved successfully!`;
    }

    // Deletes review by using its id
    async deleteReviewById(id) {
        // Delete reviews from the database
        var result = this.Reviews.deleteOne({ _id: id }).lean().exec();

        if (result != null) {
            return `Successful in deleting review ${id}!`;
        }
        else {
            return 'No results found';
        }
    }
}

// Export the class
module.exports = Reviews;