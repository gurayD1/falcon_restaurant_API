const { uuid } = require('uuidv4');
const SendEmail = require('../utils/SendEmail')

// Load mongoose since we need it to define a model
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

BookingSchema = new Schema({
    id : {type: String, default: uuid},
    date : Date,
    time_slot : String,
    name: String,
    email: String,
    phoneno: String,
}, { collection: 'booking' });

BookingSchema.set('versionKey', false);

class Booking{
    // Create initialize method in menu database class
    async initialize(connectionString) {
        await  mongoose.connection.close();
          try {
              // Connect to the atlas database
              await mongoose.connect(connectionString);
              this.Booking = mongoose.model('Booking', BookingSchema);
              return true;
          } catch (err) {
              console.log(`Could not connect to atlas server, error: '${err}'`);
              return false;
          }
      }

      async addBooking(data) {
        // Create a new subscriber object with the data inserted
        var booking = new this.Booking(data);

        // Save to the database
        await booking.save();

        //send booking details to email
        const message = `<p>Thank you for making a reservation.</p> 
        <p>Here are your booking details: </p>
        <ul>
        <li>Reservation Name: ${data.name}</li>
        <li>Reservation Time: ${data.time_slot}</li>
        <li>Reservation Date: ${data.date}</li>
        <li>Phone Number: ${data.phoneno}</li>

        </ul><br/><br/><br/>
        <p><i>We look forward to hosting you!</i></p>`
        const response = await SendEmail( 'Booking Details', message, data.email);
        if (response != "Successful") {
            return res.status(404).json({
                errors: "Unable to send email"
            });
        }
        // Show success message
        return `You have successfully made a reservation ${booking.name}!`;
    }

     //find all bookings in the database
     getAllBookings() {
        return this.Booking.find();
    }

     //delete a suscriber with email
     async deleteBooking(email) {
  
        var result = this.Booking.deleteOne({ email: email }).lean().exec();

        //check if successful or not
        if (result != null) {
            return `Successful in deleting reservation made by ${email}!`;
        }
        else {
            return 'No results found';
        }
    }

}

// Export the class
module.exports = Booking;