const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    name:{
        type: String,
        required: true
    },
    empId:{
        type: Number,
        required: true
    },
    phone:{
        type: Number,
        required: true
    },
    latitude:{
        type: Number,
        required: true
    },
    longitude:{
        type: Number,
        required: true
    },
});

module.exports = mongoose.model('User', userSchema);
