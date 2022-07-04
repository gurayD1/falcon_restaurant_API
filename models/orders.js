// Load mongoose since we need it to define a model
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

// Create restaurant schema
OrderSchema = new Schema({
    name: string,
    phone: string,
    cart: string,
    total: string,
    date: string,
}, { collection: 'orders' });


OrderSchema.set('versionKey', false);

class Order {
   
    // Create initialize method in order database class
    async initialize(connectionString) {
      await  mongoose.connection.close();
        try {
            // Connect to the atlas database
            await mongoose.connect(connectionString);
            this.Order = mongoose.model('Order', OrderSchema);
            return true;
        } catch (err) {
            console.log(`Could not connect to atlas server, error: '${err}'`);
            return false;
        }
    }

    // Add a new document in orders collection using data passed
    async addNewOrder(data) {
        // Create a new menu object with the data inserted
        var orderNew = new this.Order(data);

        // Save to the database
        await orderNew.save();

        // Show success message
        return `${orderNew._id} saved successfully!`;
    }

    // Get all orders from database depending on user input
    getAllOrders() {
        return this.Order.find();
    }

    // Get order by its id from the database
    getOrderById(_id) {
        var result = this.Order.findOne({ _id: id }).lean().exec();
        // Return result or error message
        if (result != null) {
            return result;
        }
        else {
            return 'No results found';
        }
    }
}

// Export the class
module.exports = Order;