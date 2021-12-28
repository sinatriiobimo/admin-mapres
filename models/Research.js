const mongoose = require('mongoose');
const { ObjectId } = mongoose.Schema;

const researchSchema = new mongoose.Schema({
    topic: {
        type: String,
        enum: ['Teknologi', 'Industri', 'Sipil & Arsitek', 'Medis', 'Sosial', 'Ekonomi', 'Sastra', 'Keilmuan'],
        required: true
    },
    title: {
        type: String,
        required: true
    },
    about: {
        type: String,
        required: true
    },
    document: {
        type: String,
        required: true
    },
    releaseDate: {
        type: Date,
        required: true
    },
    studentId: {
        type: ObjectId,
        ref: 'Student'
    }
});

module.exports = mongoose.model('Research', researchSchema);