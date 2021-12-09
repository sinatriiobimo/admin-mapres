const mongoose = require('mongoose');
const {ObjectId} = mongoose.Schema;

const prestasiSchema = new mongoose.Schema({
    studentId: {
        type: ObjectId,
        ref: 'Student'
    },
    event: {
        type: String,
        required: true
    },
    kepesertaan: {
        type: String,
        enum: ['Tim', 'Individu'],
        required: true,
        default: 'Individu'
    },
    category: {
        type: String,
        enum: ['Nasional', 'Internasional', 'Wilayah', 'Provinsi'],
        required: true,
        default: 'Nasional'
    },
    type: {
        type: String,
        enum: ['Akademik', 'NonAkademik'],
        required: true,
        default: 'Nasional'
    },
    teamName: {
        type: String
    },
    creation: {
        type: String,
        required: true
    },
    countryQty: {
        type: String,
    },
    uniQty: {
        type: String,
        required: true
    },
    peringkat: {
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
    majorId: {
        type: ObjectId,
        ref: 'Prestasi'
    },
    facultyId: {
        type: ObjectId,
        ref: 'Faculty'
    }
});

module.exports = mongoose.model('Prestasi', prestasiSchema);