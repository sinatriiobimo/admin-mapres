const mongoose = require('mongoose');
const { ObjectId } = mongoose.Schema;

const imageSchema = new mongoose.Schema({
    facultyId: {
      type: ObjectId,
      ref: 'Faculty'
    },
    image: {
        type: String,
    }
})

module.exports = mongoose.model('Image', imageSchema);