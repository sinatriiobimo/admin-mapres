const mongoose = require('mongoose');
const { ObjectId } = mongoose.Schema;

const majorSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    code: {
        type: String,
        required: true
    },
    facultyId: {
        type: ObjectId,
        ref: 'Faculty'
    },
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

module.exports = mongoose.model('Major', majorSchema);
