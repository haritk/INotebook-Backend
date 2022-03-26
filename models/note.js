var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var NoteSchema = new Schema({
    user:{
        type: mongoose.Schema.Types.ObjectId,
        //User because models mein U and not u
        ref: 'User'
    },
    title: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true,
    },
    tag: {
        type: String,
        default: "General"
    },
    date: {
        type: Date,
        default: Date.now
    },
});
module.exports = mongoose.model('Note', NoteSchema);