/* jshint node: true */

/*
 * This builds on the webServer of previous projects in that it exports the current
 * directory via webserver listing on a hard code (see portno below) port. It also
 * establishes a connection to the MongoDB named 'cs142project6'.
 *
 * To start the webserver run the command:
 *    node webServer.js
 *
 * Note that anyone able to connect to localhost:portNo will be able to fetch any file accessible
 * to the current user in the current directory or any of its children.
 *
 * This webServer exports the following URLs:
 * /              -  Returns a text status message.  Good for testing web server running.
 * /test          - (Same as /test/info)
 * /test/info     -  Returns the SchemaInfo object from the database (JSON format).  Good
 *                   for testing database connectivity.
 * /test/counts   -  Returns the population counts of the cs142 collections in the database.
 *                   Format is a JSON object with properties being the collection name and
 *                   the values being the counts.
 *
 * The following URLs need to be changed to fetch there reply values from the database.
 * /user/list     -  Returns an array containing all the User objects from the database.
 *                   (JSON format)
 * /user/:id      -  Returns the User object with the _id of id. (JSON format).
 * /photosOfUser/:id' - Returns an array with all the photos of the User (id). Each photo
 *                      should have all the Comments on the Photo (JSON format)
 *
 */

const session = require('express-session');
const bodyParser = require('body-parser');
const multer = require('multer');
const processFormBody = multer({storage: multer.memoryStorage()}).single('uploadedphoto');


var mongoose = require('mongoose');
mongoose.Promise = require('bluebird');

const fs = require("fs");

var async = require('async');

var express = require('express');
var app = express();

// Load the Mongoose schema for User, Photo, and SchemaInfo
var User = require('./schema/user.js');
var Photo = require('./schema/photo.js');
var SchemaInfo = require('./schema/schemaInfo.js');

// XXX - Your submission should work without this line. Comment out or delete this line for tests and before submission!
// var cs142models = require('./modelData/photoApp.js').cs142models;

mongoose.connect('mongodb://localhost/cs142project6', { useNewUrlParser: true, useUnifiedTopology: true });

// We have the express static module (http://expressjs.com/en/starter/static-files.html) do all
// the work for us.
app.use(express.static(__dirname));

app.use(session({secret: 'secretKey', resave: false, saveUninitialized: false}));
app.use(bodyParser.json());

app.get('/', function (request, response) {
    response.send('Simple web server of files from ' + __dirname);
});

/*
 * Use express to handle argument passing in the URL.  This .get will cause express
 * To accept URLs with /test/<something> and return the something in request.params.p1
 * If implement the get as follows:
 * /test or /test/info - Return the SchemaInfo object of the database in JSON format. This
 *                       is good for testing connectivity with  MongoDB.
 * /test/counts - Return an object with the counts of the different collections in JSON format
 */
app.get('/test/:p1', function (request, response) {
    // Express parses the ":p1" from the URL and returns it in the request.params objects.
    console.log('/test called with param1 = ', request.params.p1);

    var param = request.params.p1 || 'info';

    if (param === 'info') {
        // Fetch the SchemaInfo. There should only one of them. The query of {} will match it.
        SchemaInfo.find({}, function (err, info) {
            if (err) {
                // Query returned an error.  We pass it back to the browser with an Internal Service
                // Error (500) error code.
                console.error('Doing /user/info error:', err);
                response.status(500).send(JSON.stringify(err));
                return;
            }
            if (info.length === 0) {
                // Query didn't return an error but didn't find the SchemaInfo object - This
                // is also an internal error return.
                response.status(500).send('Missing SchemaInfo');
                return;
            }

            // We got the object - return it in JSON format.
            console.log('SchemaInfo', info[0]);
            response.end(JSON.stringify(info[0]));
        });
    } else if (param === 'counts') {
        // In order to return the counts of all the collections we need to do an async
        // call to each collections. That is tricky to do so we use the async package
        // do the work.  We put the collections into array and use async.each to
        // do each .count() query.
        var collections = [
            {name: 'user', collection: User},
            {name: 'photo', collection: Photo},
            {name: 'schemaInfo', collection: SchemaInfo}
        ];
        async.each(collections, function (col, done_callback) {
            col.collection.countDocuments({}, function (err, count) {
                col.count = count;
                done_callback(err);
            });
        }, function (err) {
            if (err) {
                response.status(500).send(JSON.stringify(err));
            } else {
                var obj = {};
                for (var i = 0; i < collections.length; i++) {
                    obj[collections[i].name] = collections[i].count;
                }
                response.end(JSON.stringify(obj));

            }
        });
    } else {
        // If we know understand the parameter we return a (Bad Parameter) (400) status.
        response.status(400).send('Bad param ' + param);
    }
});

/*
 * URL /user/list - Return all the User object.
 */
app.get('/user/list', function (request, response) {
    if (!request.session.user_id) {
        response.status(401).send("No user logged in!");
        return;
    }
    User.find({}, '-location -description -occupation -login_name -password -__v', function (err, users) {
        // let users_list = JSON.parse(JSON.stringify(users));;
        let users_list = users;
        async.eachOf(users, function(user, i, allDone){
            if (user === null) {
                console.log('User with _id:' + user[0] + ' not found.');
                response.status(400).send('Not found');
            } else {
                // let {_id, first_name, last_name} = user;
                users_list[i] = user;//{_id, first_name, last_name};
                allDone();
            }
            // response.status(200).send(user);
            
            // We got the object - return it in JSON format.
            // console.log('User Info', user[0]);
            // response.end(JSON.stringify(user[0]));
            }, function () {
                if (err) {
                    // Query returned an error.  We pass it back to the browser with an Internal Service
                    // Error (500) error code.
                    console.error('Doing /user/:id error:', err);
                    response.status(500).send(JSON.stringify(err));
                } else {
                    response.status(200).send(users_list);
                }
            }
        );
    });
});

/*
 * URL /user/list - Return all the User object for mention.
 */
app.get('/userlist', function (request, response) {
    if (!request.session.user_id) {
        response.status(401).send("No user logged in!");
        return;
    }
    User.find({}, '-location -description -occupation -login_name -password -__v', function (err, users) {
        // let users_list = JSON.parse(JSON.stringify(users));;
        let users_list = users;
        async.eachOf(users, function(user, i, allDone){
            if (user === null) {
                console.log('User with _id:' + user[0] + ' not found.');
                response.status(400).send('Not found');
            } else {
                let id = user._id;
                let display = user.first_name + " " + user.last_name;
                users_list[i] = {id, display};
                allDone();
            }
            // response.status(200).send(user);
            
            // We got the object - return it in JSON format.
            // console.log('User Info', user[0]);
            // response.end(JSON.stringify(user[0]));
            }, function () {
                if (err) {
                    // Query returned an error.  We pass it back to the browser with an Internal Service
                    // Error (500) error code.
                    console.error('Doing /user/:id error:', err);
                    response.status(500).send(JSON.stringify(err));
                } else {
                    response.status(200).send(users_list);
                }
            }
        );
    });
});


/*
 * URL /user/:id - Return the information for User (id)
 */
app.get('/user/:id', function (request, response) {
    if (!request.session.user_id) {
        response.status(401).send("No user logged in!");
        return;
    }
    var user_id = request.params.id;
    User.findOne({_id: user_id}, '-__v -login_name -password', function (err, user) {
        if (err) {
            console.error('Doing /user/:id error:', err);
            response.status(400).send(err);//JSON.stringify(err));
            return;
        }
        if (user === null) {
            console.log('User with _id:' + user_id + ' not found.');
            response.status(400).send('Not found');
            return;
        }
        // console.log('User Info', user);
        response.status(200).send(user);
    });
});


/*
 * URL /photosOfUser/:id - Return the Photos for User (id)
 */
app.get('/photosOfUser/:id', function (request, response) {
    if (!request.session.user_id) {
        response.status(401).send("No user logged in!");
        return;
    }
    var user_id = request.params.id; 
    Photo.find({user_id: user_id},'-__v', function (errU, photos) {
        if (errU) {
            // Query returned an error.  We pass it back to the browser with an Internal Service
            // Error (500) error code.
            console.error('No user with that id: ', errU);
            response.status(400).send("No user with that id");
            return;
        }
        let users_photos = JSON.parse(JSON.stringify(photos));
        users_photos = users_photos.sort(function(a, b) {return a.date_time < b.date_time ? 1 : -1;});
        async.eachOf(users_photos, function(photo, i, allDonePhotos){
            if (photo === null) {
                console.log('User with _id:' + photo._id + ' not found.');
                response.status(400).send('Not found');
            } else {
                async.eachOf(photo.comments, function(comment, j, allDoneComments){
                    let comment_user = User.findById(comment.user_id,'-__v', function (err, user) {
                        if (err) {
                            console.error('Doing /user/:id error:', err);
                            response.status(400).send(err);
                            return;
                        }
                        if (user === null) {
                            console.log('User with _id:' + user_id + ' not found.');
                            response.status(400).send('Not found');
                        }
                    }).clone().catch(function(err){ console.log(err);});
                    comment_user.then(function(user) {
                        let {_id, first_name, last_name} = user;
                        photo.comments[j] = {
                            _id: comment._id,
                            // photo_id: photo._id,
                            user: {_id: _id, first_name: first_name, last_name:last_name}, 
                            date_time: comment.date_time,
                            comment: comment.comment,
                        };
                        allDoneComments();
                    });
                }, function(err) {
                    if (err){
                        // console.error('Comment error: ', err);
                        response.status(400).send(err);
                        // response.status(500).send(JSON.stringify(err));
                        // return;
                    }
                    users_photos[i] = photo;
                    allDonePhotos();
                });
            
            }
        }, function(err) {
            if (err){
                console.error('Photo error: ', err);
                // response.status(500).send(JSON.stringify(err));
                // return;
            } else {
                response.status(200).send(users_photos);
            }

        });
    });

});

app.post('/admin/login', function (request, response) {
    // if (!request.session.user_id) {
    //     response.status(401).send("No user logged in!")
    //     return;
    // }
    console.log(User);
    let login_username = request.body.login_name;
    let password = request.body.password;
    User.findOne({login_name: login_username}, function (err, user) {
        if (err) {
            console.error('Error finding username:', err);
            response.status(400).send('Error finding username');
            return;
        }
        if (user === null) {
            console.log('Username:' + login_username + ' not found.');
            response.status(400).send('Username not found');
            return;
        }
        if (password !== user.password) {
            response.status(400).send("Incorrect password");
            return;
        }
        request.session.login_name = login_username;
        request.session.user_id = user._id;
        response.status(200).send(user);
    });
});

app.post('/user', function (request, response) {
    // if (!request.session.user_id) {
    //     response.status(401).send("No user logged in!")
    //     return;
    // }
    // console.log(request.body);
    let {login_name, password, first_name, last_name, occupation, location, description} = request.body;

    if (first_name === undefined || first_name === undefined || password === undefined || login_name === undefined) {
        console.log('Missing parameters');
        response.status(400).send('Missing Parameters!');
        return;
    }
    User.findOne({login_name: login_name}, function (err, user) {
        if (err) {
            console.error('Error creating user:', err);
            response.status(400).send('Error creating user');
            return;
        }
        if (user === null) {
            User.create({login_name, password, first_name, last_name, occupation, location, description}, function(err2, u) {
                if (err2) {
                    console.error('Error creating user:', err);
                    response.status(400).send('Error creating user');
                    return;
                }
                request.session.login_name = login_name;
                request.session.user_id = u._id;
                response.status(200).send({id: u._id, first_name: first_name, last_name: last_name, login_name: login_name});
            });
        } else {
            console.log('User with _id:' + user._id + ' already exists.');
            response.status(400).send('Username already exists.');
        }
    });
});

app.post('/commentsOfPhoto/:photo_id', function(request, response) {
    if (!request.session.user_id) {
        response.status(401).send("No user logged in!");
        return;
    }
    let comment = request.body.comment;
    if (!comment) {
        console.log('Comment not writen');
        response.status(400).send('Comment not writen');
    }
    Photo.findOne({_id: request.params.photo_id}, function (err, photo) {
        if (err) {
            console.log('Error posting the comment');
            response.status(400).send('Error posting the comment');
            return;
        }
        photo.comments.push({comment: comment, date_time: new Date(), user_id: request.session.user_id});
        photo.save();
        response.status(200).send(photo);
    });
}); 

app.post('/photos/new', function(request, response) {
    if (!request.session.user_id) {
        response.status(401).send("No user logged in!");
        return;
    }
    processFormBody(request, response, function (err) {
        if (err || !request.file) {
            console.log('Could not upload the image file.');
            response.status(400).send('Could not upload the image file.');
            return;
        }
        // request.file has the following properties of interest
        //      fieldname      - Should be 'uploadedphoto' since that is what we sent
        //      originalname:  - The name of the file the user uploaded
        //      mimetype:      - The mimetype of the image (e.g. 'image/jpeg',  'image/png')
        //      buffer:        - A node Buffer containing the contents of the file
        //      size:          - The size of the file in bytes
    
        // XXX - Do some validation here.
        // We need to create the file in the directory "images" under an unique name. We make
        // the original file name unique by adding a unique prefix with a timestamp.
        const timestamp = new Date().valueOf();
        const filename = 'U' +  String(timestamp) + request.file.originalname;
    
        fs.writeFile("./images/" + filename, request.file.buffer, function (err2) {
            if (err2) {
                console.log('Could not write the image file.');
                response.status(400).send('Could not write the image file.');
                return;
            }
            let user_id = request.session.user_id;
          // XXX - Once you have the file written into your images directory under the name
          // filename you can create the Photo object in the database
            Photo.create({file_name: filename,date_time: Date.now(), user_id: user_id, comments: []}, function(err3, photo) {
                if (err3) {
                    console.log('Could not post the image file.');
                    response.status(400).send('Could not post the image file.');
                    return;
                }
                photo.save();
                response.status(200).send();
            });
        });
    });
}); 

app.post('/admin/logout', function (request, response) {
    // if (!request.session.user_id) {
    //     response.status(401).send("No user logged in!")
    //     return;
    // }
    request.session.destroy(function(err) {
        if (err) {
            response.status(400).send("could not log out.");
            return;
        }
        response.status(200).send();
    });
});

app.post(`/mentions/:id`, function (request, response) {
    if (!request.session.user_id) {
        response.status(401).send("No user logged in!");
        return;
    }
    let user_id = request.body.user_id;
    let photo_id = request.body.photo_id;

    User.findById(user_id,'-__v', function (err, user) {
        if (err) {
            console.error('Doing /user/:id error:', err);
            response.status(400).send(err);
            return;
        }
        if (user === null) {
            console.log('User with _id:' + user_id + ' not found.');
            response.status(400).send('Not found');
        }
        user.mentions.push(photo_id);
        user.save();
        response.status(200).send(user);
    }).clone().catch(function(err){ console.log(err);});
});

app.post(`/photo`, function (request, response) {
    if (!request.session.user_id) {
        response.status(401).send("No user logged in!");
        return;
    }
    let photo_ids = request.body.photo_ids;  
    Photo.find({_id: { $in: photo_ids}}, function (err, photos) {
        if (err) {
            console.error('Doing /user/:id error:', err);
            response.status(400).send(err);
            return;
        }
        if (photos === null) {
            // console.log('User with _id:' + photo._id + ' not found.');
            response.status(400).send('Not found');
        }
        response.status(200).send(photos);
    }).clone().catch(function(err){ console.log(err);});
});

app.get('/mostcomment/:id', function(request, response) {
    var user_id = request.params.id; 
    Photo.find({user_id: user_id},'-__v', function (errU, photos) {
        if (errU) {
            // Query returned an error.  We pass it back to the browser with an Internal Service
            // Error (500) error code.
            console.error('No user with that id: ', errU);
            response.status(400).send("No user with that id");
            return;
        }
        let users_photos = JSON.parse(JSON.stringify(photos));
        users_photos = users_photos.sort(function(a, b) {return a.date_time < b.date_time ? 1 : -1;});
        let most_comments;
        async.eachOf(users_photos, function(photo, _, callBack) {
            if (most_comments === undefined) {
                most_comments = photo;
            } else if (most_comments.comments.length < photo.comments.length) {
                    most_comments = photo;
                }
            callBack();
        }, function(err) {
            if (err){
                response.status(400).send(err);
                // response.status(500).send(JSON.stringify(err));
                // return;
            }
            // callBack();
        });
        response.status(200).send(most_comments);
    });
});

app.get('/mostrecent/:id', function(request, response) {
    var user_id = request.params.id; 
    Photo.find({user_id: user_id},'-__v', function (errU, photos) {
        if (errU) {
            // Query returned an error.  We pass it back to the browser with an Internal Service
            // Error (500) error code.
            console.error('No user with that id: ', errU);
            response.status(400).send("No user with that id");
            return;
        }
        let users_photos = photos.sort(function(a, b) {return a.date_time < b.date_time ? 1 : -1;});//function(a, b) {return a.date_time > b.date_time ? 1 : -1;});
        // console.log("these are  user photos:", users_photos);
        users_photos = JSON.parse(JSON.stringify(photos));
        // console.log("slice:   ", users_photos.slice(-1)[0]);
        // console.log('zero:    ', users_photos[0]);
        let mostrecent = users_photos[0] ;
        response.status(200).send(mostrecent);
    });
});

app.get('/userdata/:id', function(request, response) {
    var user_id = request.params.id; 
    User.findById(user_id, '-location -description -occupation -login_name -password -mentions -__v', function (err, user) {
        if (err) {
            console.error('Doing /user/:id error:', err);
            response.status(400).send(err);
            return;
        }
        if (user === null) {
            console.log('User with _id:' + user_id + ' not found.');
            response.status(400).send('Not found');
        }
        response.status(200).send(user);
    });
});

app.post(`/usersdata`, function(request, response) {
    if (!request.session.user_id) {
        response.status(401).send("No user logged in!");
        return;
    }
    let user_ids = request.body.user_ids;  
    User.find({_id: { $in: user_ids}},'-location -description -occupation -login_name -mentions -password -__v', function (err, users) {
        if (err) {
            console.error('Doing /user/:id error:', err);
            response.status(400).send(err);
            return;
        }
        if (users === null) {
            // console.log('User with _id:' + photo._id + ' not found.');
            response.status(400).send('Not found');
        }
        response.status(200).send(users);
    }).clone().catch(function(err){ console.log(err);});
});

app.get('/loginuser', function(request, response) {
    if (!request.session.user_id) {
        response.status(401).send("No user logged in!");
        return;
    }
    let user_id = request.session.user_id;
    User.findById(user_id, function(err, user) {
        // console.log(user);
        if (err) {
            console.error('Doing /user/:id error:', err);
            response.status(400).send(err);
            return;
        }
        if (user === null) {
            response.status(400).send('Not found');
        }
        response.status(200).send(user);
    });
});

app.post('/favoritesInfo', function(request, response) {
    if (!request.session.user_id) {
        response.status(401).send("No user logged in!");
        return;
    }
    let user_id = request.session.user_id;
    let photo_id = request.body.photo_id;
    User.findById(user_id, function(err, user) {
        if (err) {
            console.error('Doing /user/:id error:', err);
            response.status(400).send(err);
            return;
        }
        if (user === null) {
            response.status(400).send('Not found');
        }
        if (user.favorites.includes(photo_id)) {
            user.favorites.splice(user.favorites.indexOf(photo_id), 1);
        } else {
            user.favorites.push(photo_id);
        }
        user.save();
        Photo.findById(photo_id, function(err2, photo) {
            if (err2) {
                console.error('Doing /user/:id error:', err2);
                response.status(400).send(err2);
                return;
            }
            if (photo === null) {
                response.status(400).send('Not found');
            }
            if (photo.favorites.includes(user_id)) {
                photo.favorites.splice(photo.favorites.indexOf(user_id), 1);
            } else {
                photo.favorites.push(user_id);
            }
            photo.save();
            response.status(200).send(user);
        });
    });
});

app.get('/favorites', function(request, response) {
    if (!request.session.user_id) {
        response.status(401).send("No user logged in!");
        return;
    }
    let user_id = request.session.user_id;
    User.findById(user_id, function(err, user) {
        if (err) {
            console.error('Doing /user/:id error:', err);
            response.status(400).send(err);
            return;
        }
        if (user === null) {
            response.status(400).send('Not found');
        }
        response.status(200).send(user.favorites);
    });
});

var server = app.listen(3000, function () {
    var port = server.address().port;
    console.log('Listening at http://localhost:' + port + ' exporting the directory ' + __dirname);
});


