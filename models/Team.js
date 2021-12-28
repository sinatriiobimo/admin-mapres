const mongoose = require('mongoose');
const { ObjectId } = mongoose.Schema;

const teamSchema = new mongoose.Schema({
    name: {
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
    }]
});

module.exports = mongoose.model('Team', teamSchema);