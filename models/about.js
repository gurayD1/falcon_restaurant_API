// Load mongoose since we need it to define a model
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

// Create about schema
AboutSchema = new Schema({
    about_id: String,
    image: String,
    title: String,
    name: String
}, { collection: 'about' });


AboutSchema.set('versionKey', false);

class About {
   
    // Create initialize method in menu database class
    async initialize(connectionString) {
      await  mongoose.connection.close();
        try {
            // Connect to the atlas database
            await mongoose.connect(connectionString);
            this.About = mongoose.model('About', AboutSchema);
            return true;
        } catch (err) {
            console.log(`Could not connect to atlas server, error: '${err}'`);
            return false;
        }
    }

    // Add a new document in about collection using data passed
    async addNewAbout(data) {
        // Create a new about object with the data inserted
        var aboutNew = new this.About(data);

       let isIdAvailable = await this.About.findOne({ about_id: aboutNew.about_id }) ? false : true

        if(isIdAvailable){
        
          //  console.log(aboutNew)

        }else{
          //  console.log("is not available")
            var lastId = { about_id: '' }
            lastId = await this.About.find({},{ about_id: 1, _id:0 }).sort({_id:-1}).limit(1)

            var newId = parseInt(lastId[0].about_id)
            newId += 1
            //console.log(newId)
            aboutNew.about_id = newId
            //console.log(aboutNew)
        }
        
        // Save to the database
        await aboutNew.save();

        // Show success message
        return `${aboutNew._id} saved successfully!`;
    }

    // Get all about from database depending on user input
    getAllAbout() {
        return this.About.find();
    }

    // Get about by its id from the database
    getAboutById(id) {
        var result = this.About.findOne({ about_id: id }).lean().exec();
        // Return result or error message
        if (result != null) {
            return result;
        }
        else {
            return 'No results found';
        }
    }

    // Update about by using its id
    async updateAboutById(data, id) {
        // $set replaces each field with the data
        var result = this.About.updateOne({ about_id: id }, { $set: data }).lean().exec();
        if (result != null) {
            return `Successful in updated person ${id}!`;
        }
        else {
            return 'No results found';
        }
    }

    // Deletes about by using its id
    async deleteAboutById(id) {
        // Delete about from the database
        var result = this.About.deleteOne({ about_id: id }).lean().exec();

        if (result != null) {
            return `Successful in deleted person ${id}!`;
        }
        else {
            return 'No results found';
        }
    }
    // Deletes about by using object id
    async deleteAboutByMongoId(id) {
        // Delete about from the database
        var ObjectId = require('mongodb').ObjectID;
        var result = this.About.deleteOne( { "_id" : new ObjectId(`${id}`) } ).lean().exec();

        if (result != null) {
            return `Successful in deleting about ${id}!`;
        }
        else {
            return 'No results found';
        }
    }
}

// Export the class
module.exports = About;