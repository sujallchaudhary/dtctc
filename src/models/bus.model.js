const mongoose = require('mongoose');

const busSchema = new mongoose.Schema({
    busNumber:{
        type: Number,
        required: true
    },
    route:{
        type: String,
        required: true
    },
    checkCount:{
        type: Number,
        required: true
    },
    direction:{
        type: String,
        required: true
    },
});

module.exports = mongoose.model('Bus', busSchema);