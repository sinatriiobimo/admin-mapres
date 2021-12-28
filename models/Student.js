const mongoose = require('mongoose');
const { ObjectId } = mongoose.Schema;

const studentSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    npm: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    telp: {
        type: String,
        required: true
    },
    yearStart: {
        type: Date,
        required: true
    },
    image: {
        type: String
    },
    facultyId: {
        type: ObjectId,
        ref: 'Faculty'
    },
    majorId: {
        type: ObjectId,
        ref: 'Major'
    },
    achievementId: [{
        type: ObjectId,
        ref: 'Achievement'
    }],
    researchId: [{
        type: ObjectId,
        ref: 'Research'
    }],
    distinguishId: [{
        type: ObjectId,
        ref: 'Distinguish'
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

module.exports = mongoose.model('Student', studentSchema);
