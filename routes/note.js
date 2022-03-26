var express = require('express');
var router = express.Router();

const fetchUser = require('../middleware/user');
//used for validation
const { body, validationResult } = require('express-validator');

//to use the model, we need to import the model as wel
var Note = require("../models/note");

//getting notes made by a user
router.get('/fetchallnotes', fetchUser, async function (req, res, next) {
    try {
        const userId = req.user.id;
        console.log(userId);
        const notes = await Note.find({ user: req.user.id  });
        console.log(notes);
        res.send(notes);
    } catch (error) {
        console.log(error);
        res.status(500).send("internal server error")
    }

});

router.post('/addnote', fetchUser, [
    body('title', 'Enter a valid title').isLength({ min: 3 }),
    body('description', 'description >=5').isLength({ min: 5 }),
], async function (req, res, next) {

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    const { title, description, tag } = req.body;

    Note.create({ 'title': title, 'description': description, 'tag': tag, 'user': req.user.id })
        .then((note) => {
            res.statusCode = 200;
            res.setHeader('Content-Type', 'application/json');
            res.json({ note, success: true, err: "" });
            console.log(note)
        })
        .catch(err => {
            console.log(err);
            res.statusCode = 500;
            res.setHeader('Content-Type', 'application/json');
            res.json({ success: false, err: err });
        });

})

router.put('/updatenote/:id', fetchUser, async function (req, res, next) {

    const { title, description, tag } = req.body;
    const newNote = {};
    if (title) { newNote.title = title };
    if (description) { newNote.description = description };
    if (tag) { newNote.tag = tag };

    let note = await Note.findById(req.params.id);
    //check if note exists
    if (!note) { return res.status(404).send("not found") }

    //check if the user of the note is the same as the user
    //trying to change the note
    if (note.user.toString() !== req.user.id) {
        return res.status(404).send("not allowed")
    }
    note = await Note.findByIdAndUpdate(req.params.id, { $set: newNote }, { new: true });
    res.json({ note });

})

router.delete('/deletenote/:id', fetchUser, async function (req, res, next) {

    try {
        let note = await Note.findById(req.params.id);
        //check if note exists
        if (!note) { return res.status(404).send("not found") }

        //check if the user of the note is the same as the user
        //trying to change the note
        if (note.user.toString() !== req.user.id) {
            return res.status(404).send("not allowed")
        }
        note = await Note.findByIdAndDelete(req.params.id);
        res.json({ "success": "note has been deleted", note });

    }catch(error){
        console.log(error);
        res.status(500).send("internal server error")
    }
    

})

module.exports = router;