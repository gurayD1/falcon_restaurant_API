var mongoose = require('mongoose');
var Schema = mongoose.Schema;

NewsSchema = new Schema({
    id : {type: String, default: uuid.v4},
    first_name: String,
    email: String
}, { collection: 'newsletter' });

NewsSchema.set('versionKey', false);

class Newsletter{
    // Create initialize method in menu database class
    async initialize(connectionString) {
        await  mongoose.connection.close();
          try {
              // Connect to the atlas database
              await mongoose.connect(connectionString);
              this.News = mongoose.model('Newsletter', NewsSchema);
              return true;
          } catch (err) {
              console.log(`Could not connect to atlas server, error: '${err}'`);
              return false;
          }
      }

      async addNewSubscriber(data) {
        // Create a new subscriber object with the data inserted
        var subNew = new this.News(data);

        // Save to the database
        await subNew.save();

        // Show success message
        return `${subNew.email} saved successfully!`;
    }

    //find all subscribers in the database
    getAllSubscribers() {
        return this.News.find();
    }

    //delete a suscriber with email
    async deleteSubByEmail(email) {
  
        var result = this.News.deleteOne({ email: email }).lean().exec();

        //check if successful or not
        if (result != null) {
            return `Successful in deleting subscriber ${email}!`;
        }
        else {
            return 'No results found';
        }
    }
}

// Export the class
module.exports = Newsletter;