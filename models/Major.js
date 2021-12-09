const mongoose = require('mongoose');
const {ObjectId} = mongoose.Schema;

const majorSchema = new mongoose.Schema({
    facultyId: {
        type: ObjectId,
        ref: 'Faculty'
    },
    code: {
        type: String,
        required: true
    },
    name: {
        type: String,
        required: true
    },
    prestasiId: [{
        type: ObjectId,
        ref: 'Prestasi'
    }],
    studentId: [{
        type: ObjectId,
        ref: 'Student'
    }],
});

module.exports = mongoose.model('Major', majorSchema);