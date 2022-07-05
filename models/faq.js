// Load mongoose since we need it to define a model
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

// Create faq schema
FaqSchema = new Schema({
    faq_id: String,
    question: String,
    answer: String
}, { collection: 'faq' });


FaqSchema.set('versionKey', false);

class Faq {
   
    // Create initialize method in menu database class
    async initialize(connectionString) {
      await  mongoose.connection.close();
        try {
            // Connect to the atlas database
            await mongoose.connect(connectionString);
            this.Faq = mongoose.model('Faq', FaqSchema);
            return true;
        } catch (err) {
            console.log(`Could not connect to atlas server, error: '${err}'`);
            return false;
        }
    }

    // Add a new document in faq collection using data passed
    async addNewFaq(data) {
        // Create a new faq object with the data inserted
        var faqNew = new this.Faq(data);

       let isIdAvailable = await this.Faq.findOne({ faq_id: faqNew.faq_id }) ? false : true

        if(isIdAvailable){
        
          //  console.log(faqNew)

        }else{
          //  console.log("is not available")
            var lastId = { faq_id: '' }
            lastId = await this.Faq.find({},{ faq_id: 1, _id:0 }).sort({_id:-1}).limit(1)

            var newId = parseInt(lastId[0].faq_id)
            newId += 1
            //console.log(newId)
            faqNew.faq_id = newId
            //console.log(faqNew)
        }
        
        // Save to the database
        await faqNew.save();

        // Show success message
        return `${faqNew._id} saved successfully!`;
    }

    // Get all faq from database depending on user input
    getAllFaq() {
        return this.Faq.find();
    }

    // Get faq by its id from the database
    getFaqById(id) {
        var result = this.Faq.findOne({ faq_id: id }).lean().exec();
        // Return result or error message
        if (result != null) {
            return result;
        }
        else {
            return 'No results found';
        }
    }

    // Update faq by using its id
    async updateFaqById(data, id) {
        // $set replaces each field with the data
        var result = this.Faq.updateOne({ faq_id: id }, { $set: data }).lean().exec();
        if (result != null) {
            return `Successful in updating faq ${id}!`;
        }
        else {
            return 'No results found';
        }
    }

    // Deletes faq by using its id
    async deleteFaqById(id) {
        // Delete faq from the database
        var result = this.Faq.deleteOne({ faq_id: id }).lean().exec();

        if (result != null) {
            return `Successful in deleting faq ${id}!`;
        }
        else {
            return 'No results found';
        }
    }
    // Deletes faq by using object id
    async deleteFaqByMongoId(id) {
        // Delete faq from the database
        var ObjectId = require('mongodb').ObjectID;
        var result = this.Faq.deleteOne( { "_id" : new ObjectId(`${id}`) } ).lean().exec();

        if (result != null) {
            return `Successful in deleting faq ${id}!`;
        }
        else {
            return 'No results found';
        }
    }
}

// Export the class
module.exports = Faq;