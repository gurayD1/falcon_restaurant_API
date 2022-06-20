const { uuid } = require('uuidv4');

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

NewsSchema = new Schema({
    id : {type: String, default: uuid},
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
              this.Newsletter = mongoose.model('Newsletter', NewsSchema);
              return true;
          } catch (err) {
              console.log(`Could not connect to atlas server, error: '${err}'`);
              return false;
          }
      }

      async addNewSubscriber(data) {
        console.log(data)
        // Create a new subscriber object with the data inserted
        var subNew = new Newsletter(data)

        // Save to the database
        await subNew.save()
                      

        // Show success message
        return `${subNew.email} saved successfully!`;
    }

    //find all subscribers in the database
    getAllSubscribers() {
        return this.Newsletter.find();
    }

    //delete a suscriber with email
    async deleteSubByEmail(email) {
  
        var result = this.Newsletter.deleteOne({ email: email }).lean().exec();

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