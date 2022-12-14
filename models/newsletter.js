const { uuid } = require('uuidv4');
const SendEmail = require('../utils/SendEmail')
var mongoose = require('mongoose');
// var url = require('../config/database')
var Schema = mongoose.Schema;

NewsSchema = new Schema({
    id : {type: String, default: uuid},
    first_name: String,
    email: String
}, { collection: 'newsletters' });

NewsSchema.set('versionKey', false);

class Newsletter{
    // Create initialize method in menu database class
    async initialize(connectionString) {
        await  mongoose.connection.close();
          try {
              // Connect to the atlas database
              await mongoose.connect(connectionString);
              this.Newsletter = mongoose.model('Newsletter', NewsSchema);
              console.log("connected")
              return true;
          } catch (err) {
              console.log(`Could not connect to atlas server, error: '${err}'`);
              return false;
          }
      }

      async addNewSubscriber(data) {
        console.log(data)
        // Create a new subscriber object with the data inserted
        var subNew = new this.Newsletter(data)
        console.log(subNew.email)

        // Save to the database
        await subNew.save()
                      

        //send subscription confirmation email.
        const message = `<p>Thank you for Subscribing to our newsletter ${subNew.first_name}.</p> <p>We are excited to keep you up to date with our lastest deals and menu.</p>`
        const response = await SendEmail( 'Subscribe to Newsletter', message, subNew.email);
        if (response != "Successful") {
            return res.status(404).json({
                errors: "Unable to send email"
            });
        }
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