const mongoose = require('mongoose');
const { ObjectId } = mongoose.Schema;

const majorSchema = new mongoose.Schema({
    facultyId: {
        type: ObjectId,
        ref: 'Faculty'
    },
    name: {
        type: String,
        required: true
    },
    code: {
        type: String,
        required: true
    },
    studentId: [{
        type: ObjectId,
        ref: 'Student'
    }],
    achievementId: [{
        type: ObjectId,
        ref: 'Achievement'
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

module.exports = mongoose.model('Major', majorSchema);
