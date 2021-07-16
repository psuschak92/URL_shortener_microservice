require('dotenv').config();
const MONGO_URI = process.env.MONGO_URI;
const mongoose = require('mongoose');
const Schema = mongoose.Schema;
mongoose.connect(MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true });

const URLSchema = new Schema({
    originalURL: String,
    shortURL: Number
});

const URLModel = mongoose.model('URL', URLSchema);

const createURL = (URLString, done) => {
    URLModel.estimatedDocumentCount((err, count) => {
        if(err) {
            if(err) return done(err);
        } else {
            const URL = new URLModel({originalURL: URLString, shortURL: count});
            URL.save((err, data) => {
            if(err) return done(err);
            else done(null, data);
            });
        }
    });
}

// const findURL = (URLString, done) => {
//     URLModel.find({originalURL: URLString}, (err, data) => {
//         if(err) return handleError(err);
//         else done(null, data);
//     });
// }

exports.URLModel = URLModel;
exports.createURL = createURL;
// exports.findURL = findURL;