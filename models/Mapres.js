const mongoose = require('mongoose');
const {ObjectId} = mongoose.Schema;

const mapresSchema = new mongoose.Schema({
    tips: {
        type: String,
        required: true
    },
    label: {
        type: String,
        required: true
    },
    studentId: {
        type: ObjectId,
        ref: 'Student'
    },
    facultyId: {
        type: ObjectId,
        ref: 'Faculty'
    }
});

module.exports = mongoose.model('Mapres', mapresSchema);