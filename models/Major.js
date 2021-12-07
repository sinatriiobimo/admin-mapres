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
    academic: {
        type: Number,
        required: true
    },
    nonAcademic: {
        type: Number,
        required: true
    },
    studentId: [{
        type: ObjectId,
        ref: 'Students'
    }],
});

module.exports = mongoose.model('Major', majorSchema);