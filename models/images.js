// Load mongoose since we need it to define a model
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

// Create images schema
ImageSchema = new Schema({
    image_id: String,
    image: String
}, { collection: 'images' });


ImageSchema.set('versionKey', false);

class Image {
   
    // Create initialize method in menu database class
    async initialize(connectionString) {
      await  mongoose.connection.close();
        try {
            // Connect to the atlas database
            await mongoose.connect(connectionString);
            this.Image = mongoose.model('Images', ImageSchema);
            return true;
        } catch (err) {
            console.log(`Could not connect to atlas server, error: '${err}'`);
            return false;
        }
    }

    // Add a new document in images collection using data passed
    async addNewImage(data) {
        // Create a new image object with the data inserted
        var imageNew = new this.Image(data);

       let isIdAvailable = await this.Image.findOne({ image_id: imageNew.image_id }) ? false : true

        if(isIdAvailable){
        
          //  console.log(imageNew)

        }else{
          //  console.log("is not available")
            var lastId = { image_id: '' }
            lastId = await this.Image.find({},{ image_id: 1, _id:0 }).sort({_id:-1}).limit(1)

            var newId = parseInt(lastId[0].image_id)
            newId += 1
            //console.log(newId)
            imageNew.image_id = newId
            //console.log(imageNew)
        }
        
        // Save to the database
        await imageNew.save();

        // Show success message
        return `${imageNew._id} saved successfully!`;
    }

    // Get all image from database depending on user input
    getAllImage() {
        return this.Image.find();
    }

    // Get image by its id from the database
    getImageById(id) {
        var result = this.Image.findOne({ image_id: id }).lean().exec();
        // Return result or error message
        if (result != null) {
            return result;
        }
        else {
            return 'No results found';
        }
    }

    // Update image by using its id
    async updateImageById(data, id) {
        // $set replaces each field with the data
        var result = this.Image.updateOne({ image_id: id }, { $set: data }).lean().exec();
        if (result != null) {
            return `Successful in updating image ${id}!`;
        }
        else {
            return 'No results found';
        }
    }

    // Deletes image by using its id
    async deleteImageById(id) {
        // Delete image from the database
        var result = this.Image.deleteOne({ image_id: id }).lean().exec();

        if (result != null) {
            return `Successful in deleting image ${id}!`;
        }
        else {
            return 'No results found';
        }
    }
    // Deletes image by using object id
    async deleteImageByMongoId(id) {
        // Delete image from the database
        var ObjectId = require('mongodb').ObjectID;
        var result = this.Image.deleteOne( { "_id" : new ObjectId(`${id}`) } ).lean().exec();

        if (result != null) {
            return `Successful in deleting image ${id}!`;
        }
        else {
            return 'No results found';
        }
    }
}

// Export the class
module.exports = Image;