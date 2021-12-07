const mongoose = require('mongoose');
const {ObjectId} = mongoose.Schema;

const studentSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    npm: {
        type: String,
        required: true
    },
    facultyId: {
        type: ObjectId,
        ref: 'Faculty'
    },
    majorId: {
        type: ObjectId,
        ref: 'Major'
    },
    email: {
        type: String,
        required: true
    },
    noTelp: {
        type: String,
        required: true
    },
    image: {
        type: String,
        required: true
    },
    yearStart: {
        type: Date,
        required: true
    },
    prestasiId: [{
        type: ObjectId,
        ref: 'Prestasi'
    }]
});

module.exports = mongoose.model('Student', studentSchema);