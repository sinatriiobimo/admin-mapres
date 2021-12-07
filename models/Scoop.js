const mongoose = require("mongoose");
const {ObjectId} = mongoose.Schema;

const scoopSchema = new mongoose.Schema({
    newsId: [{
        type: ObjectId,
        ref: 'News'
    }], 
    name: {
        type: String
    }
})

module.exports = mongoose.model('Scoop', scoopSchema);