const mongoose = require('mongoose');

const newsSchema = new mongoose.Schema({
    topic: {
        type: String,
        enum: ['Teknologi', 'Industri', 'Sipil & Arsitek', 'Medis', 'Sosial', 'Ekonomi', 'Sastra', 'Keilmuan'],
        required: true
    },
    headline: {
        type: String,
        required: true
    },
    about: {
        type: String,
        required: true
    },
    image: {
        type: String,
        required: true
    }
});

module.exports = mongoose.model('News', newsSchema);