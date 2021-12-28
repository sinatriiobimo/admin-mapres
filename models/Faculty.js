const mongoose = require('mongoose');
const { ObjectId } = mongoose.Schema;

const facultySchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    stand: {
        type: String,
        required: true
    },
    about: {
        type: String,
        required: true
    },
    imageId: [{
        type: ObjectId,
        ref: 'Image'
    }],
    majorId: [{
        type: ObjectId,
        ref: 'Major'
    }],
    studentId: [{
        type: ObjectId,
        ref: 'Student'
    }],
    achievementId: [{
        type: ObjectId,
        ref: 'Achievement'
    }],
    researchId: [{
        type: ObjectId,
        ref: 'Research'
    }],
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Faculty', facultySchema);
