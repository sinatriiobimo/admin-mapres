const mongoose = require('mongoose');
const { ObjectId } = mongoose.Schema;

const distinguishSchema = new mongoose.Schema({
    about: {
        type: String,
        required: true
    },
    best: {
        type: String,
        required: true
    },
    studentId: {
        type: ObjectId,
        ref: 'Student'
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Distinguish', distinguishSchema);
