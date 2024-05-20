import mongoose from 'mongoose';
import shortid from 'shortid'; // Importing shortid for generating short IDs

const orderSchema = new mongoose.Schema({
    orderId: {
        type: String,
        default: shortid.generate, // Using shortid to generate unique short IDs
        unique: true,
        required: true
    },
    name: {
        type: String,
        required: true
    },
    phone_number: {
        type: Number,
        required: true
    },
    restaurant: { // Corrected spelling from restorent to restaurant
        type: String,
        required: true
    },
    table_number: {
        type: Number,
        required: true
    },
    items_desc: {
        type: Object,
        required: true
    },
    date: {
        type: Date,
        default: Date.now
    }
});

const Order = mongoose.model('Order', orderSchema);

export default Order;
