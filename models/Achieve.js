const mongoose = require('mongoose');
const {ObjectId} = mongoose.Schema;

const achieveSchema = new mongoose.Schema({
    facultyId: {
        type: ObjectId,
        ref: 'Faculty'
    },
    studQty: {
        type: Number,
        required: true
    },
    medalsQty: {
        type: Number,
        required: true
    },
    patenQty: {
        type: Number,
        required: true
    }
});

module.exports = mongoose.model('Achieve', achieveSchema);