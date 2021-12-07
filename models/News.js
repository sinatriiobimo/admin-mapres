const mongoose = require('mongoose');
const {ObjectId} = mongoose.Schema;

const newsSchema = new mongoose.Schema({
    scoopId: {
        type: ObjectId,
        ref: 'Scoop'
    },
    headline: {
        type: String,
        required: true
    },
    image: {
        type: String,
        required: true
    },
    isPopular: {
        type: Boolean,
        default: false
    },
    about: {
        type: String,
        required: true
    }
});

module.exports = mongoose.model('News', newsSchema);