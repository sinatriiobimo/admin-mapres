const mongoose = require('mongoose');
const {ObjectId} = mongoose.Schema;

const facultySchema = new mongoose.Schema({
    faculty: {
        type: String,
        required: true
    },
    stands: {
        type: String,
        required: true
    },
    imageId: [{
        type: ObjectId,
        ref: 'Image'
    }],
    about: {
        type: String,
        required: true
    },
    achieveId: [{
        type: ObjectId,
        ref: 'Achieve'
    }],
    majorId: [{
        type: ObjectId,
        ref: 'Major'
    }],
    mapresId: [{
        type: ObjectId,
        ref: 'Mapres'
    }],
    studentId: [{
        type: ObjectId,
        ref: 'Students'
    }],
});

module.exports = mongoose.model('Faculty', facultySchema);