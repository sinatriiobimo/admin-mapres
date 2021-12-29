const mongoose = require('mongoose');
const { ObjectId } = mongoose.Schema;

const achievementSchema = new mongoose.Schema({
    event: {
        type: String,
        required: true
    },
    participant: {
        type: String,
        enum: ['Tim', 'Individu'],
        required: true,
        default: 'Individu'
    },
    scale: {
        type: String,
        enum: ['Nasional', 'Internasional', 'Wilayah', 'Provinsi'],
        required: true,
        default: 'Internasional'
    },
    type: {
        type: String,
        enum: ['Akademik', 'NonAkademik'],
        required: true
    },
    creation: {
        type: String,
        required: true
    },
    countryQty: {
        type: String,
        default: '0'
    },
    uniQty: {
        type: String,
        required: true,
        default: '0'
    },
    rank: {
        type: String,
        enum: ['Juara 1', 'Juara 2', 'Juara 3', 'Harapan 1', 'Harapan 2', 'Harapan 3', 'Favorit', 'Finalist'],
        required: true,
        default: 'Finalist'
    },
    startDate: {
        type: Date,
        required: true
    },
    endDate: {
        type: Date,
        required: true
    },
    document: {
        type: String,
        required: true
    },
    newsURL: {
        type: String
    },
    studentId: {
        type: ObjectId,
        ref: 'Student'
    },
    facultyId: {
        type: ObjectId,
        ref: 'Faculty'
    },
    majorId: {
        type: ObjectId,
        ref: 'Major'
    },
    teamId: {
        type: ObjectId,
        ref: 'Team'
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Achievement', achievementSchema);
