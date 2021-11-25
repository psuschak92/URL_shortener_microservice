const express = require('express');
const server = express();
const dns = require('dns');
const PORT = process.env.PORT || 3000;
const path = require('path');

server.use('/',express.static(path.join(__dirname, 'public')));
server.use(express.urlencoded({extended: true}));
server.use(express.json());

// app.use(dns);
// app.use((err, req, res, next) => {
//     res.status(err.status).send(err.message);
// });

const URL = require('./model.js').URLModel;

server.get('/api/shorturl/:id', (req, res, next) => {
    const id = req.params.id;
    URL.findOne({shortURL: id}, (err, url) => {
        if(err) {
            return next(err);
        } else {
            console.log(url);
            res.redirect(url.originalURL);
        }
    });
});

const addURL = require('./model.js').createURL;
server.post('/api/shorturl', (req, res, next) => {
    let original_url = req.body.url;
    // check if valid url format
    const regex = /https?:\/\/(www\.)?(?!www\.)[a-zA-Z0-9]+\.[a-z\.\/]{2,}/g; 
    if(regex.test(original_url)) {
        if(original_url.endsWith('/')) {
            original_url = original_url.slice(0, original_url.length - 1);
        }
        // verify the submitted url
        let hostName = '';
        if(original_url.startsWith('https://')) {
            hostName = original_url.slice(8);
        } else if(original_url.startsWith('http://')) {
            hostName = original_url.slice(7);
        } 

        dns.lookup(hostName, (err, addresses) => {
            if(err) {
                console.log(err);
                return next(new Error());
            } else {
                console.log('addresses: %j', addresses);
                addURL(original_url, (err, data) => {
                    if (err) {
                        return next(err);
                    }
                    if (!data) {
                    console.log("Missing `done()` argument");
                    return next({ message: "Missing callback argument" });
                    }
                    // console.log(data._id);
                    URL.findById(data._id, function (err, url) {
                    if (err) {
                        return next(err);
                    }
                    const original_url = url.originalURL;
                    const short_url = url.shortURL;
                    res.json({original_url, short_url});
                    });
                });
            }
        });
    } else {
        res.json({ 'error': 'invalid url' });
    }
});

server.use((req, res, next) => {
    const err = new Error('Page not found');
    err.status = 404;
    // res.status(err.status).send(err.message);
    next(err);
});

server.use((err, req, res, next) => {
    if(err.status === 404) {
        res.status(err.status).send(err.message);
    } else {
        res.status(500).send('500 Internal server error');
    }
});

server.listen(PORT, () => {
    console.log(`Server listening at localhost:${PORT}/`);
});