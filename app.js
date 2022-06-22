// Import all required modules
require('dotenv').config()
var express = require('express');
const jwt = require('jsonwebtoken')
const session = require('express-session');
var bodyParser = require('body-parser');         // pull information from HTML POST (express4)
let cors = require('cors');

// Initialize express app
var port = process.env.PORT || 3000;
var app = express();

// Configure the database
var dbConfig = require('./config/database');
const connectionString = dbConfig.url;
const Menu = require('./models/menu');
const User = require('./models/users');
const Newsletter = require('./models/newsletter');
const Booking = require('./models/booking');
const SendEmail = require('./utils/SendEmail')
const db = new Menu();
const dbUser = new User();
const newsdb = new Newsletter();
const bookingdb = new Booking();

db.initialize(connectionString);
dbUser.changeModel();
newsdb.initialize(connectionString);
bookingdb.initialize(connectionString)
//dbUser.initialize(connectionString);


app.use(bodyParser.json())
app.use(bodyParser.urlencoded({
    'extended': 'false'
}));

app.use(cors());
app.use(express.static('views'));

var token;

// Configure session
app.use(session({
    secret: 'secretdb_groupproject_sshhhhh99281',
    saveUninitialized: true,
    resave: true
}));

// Routes, post request
// Login to API to use it
app.post('/login', async function (req, res) {

    var email1 = req.body.email;
    var password = req.body.password;

    var user = await dbUser.getUserByUserEmail(email1);

    if (user) {
        if (user.password === password) {

            const userInfo = {
                email: email1,
                pswd: password
            }

            token = jwt.sign(userInfo, process.env.ACCESS_TOKEN)
            req.session.token = token
            req.session.user = {
                myToken: token
            };
            res.send("Email and password is correct")

        } else {

            token = ""
            req.session.user = {
                myToken: token
            };
            res.send("Password is not correct")
        }

    } else {

        token = ""
        req.session.user = {
            myToken: token
        };
        res.send("User not found!")
    }
});

// Routes, get request
// Login to API to use it
//http://localhost:3000/login?email=admin@email.com&password=1234
app.get('/login', async function (req, res) {

    var email1 = req.query.email;
    var password = req.query.password;

    var user = await dbUser.getUserByUserEmail(email1);

    if (user) {
        if (user.password === password) {
            const userInfo = {
                email: email1,
                pswd: password
            }

            token = jwt.sign(userInfo, process.env.ACCESS_TOKEN)
            req.session.user = {
                myToken: token
            };

            // console.log(req.session.user)
            res.send("Email and password is correct")

        } else {
            token = ""
            req.session.user = {
                myToken: token
            };
            res.send("Password is not correct")
        }

    } else {
        token = ""
        req.session.user = {
            myToken: token
        };
        res.send("User not found!")
    }
});

// Log a user out by destroying their session and redirecting them to /login
app.get("/logout", function (req, res) {
    req.session.destroy();
    res.send("You are now logged out.")
    // res.redirect("/login");
});

// Create a new user
app.post('/registration', async function (req, res) {

    var newUser = await dbUser.addNewUser(req.body);
    try {
        res.status(201).json({
            message: newUser
        });
    } catch (err) {
        res.status(400).json({
            error: err
        });
    }

})

// Get all users
app.get('/allusers', ensureLogin, async function (req, res) {

    var result = await dbUser.getAllUsers();
    try {
        if (result.length > 0) {
            res.status(200).json(result);
        } else {
            res.status(404).json({
                error: 'There are no users!',
            })
        }
    } catch (err) {
        res.status(400).json({
            error: `${err}`
        })
    }
});

// Retrieves user which has a specific id from the database
app.get('/user/:id', ensureLogin, async function (req, res) {
    // Get the id
    let id = req.params.id
    var result = await dbUser.getUserById(id);

    // Show result or error message
    try {
        if (result) {
            res.status(200).json(result);
        } else {
            res.status(404).json({
                error: 'There are no food matches with that ID!'
            });
        }
    } catch (err) {
        res.status(400).json({
            error: err
        });
    }
});


// Update/overwrite a user in the database using its id
app.put('/user/:id', ensureLogin, async function (req, res) {
    // Get the id
    let id = req.params.id

    // Update the food by using its id
    var result = await dbUser.updateUserById(req.body, id);
    try {
        if (result) {
            console.log(res);
            res.status(200).json({
                message: result
            });
        } else {
            res.status(404).json({
                error: 'There are no user matches with that ID!'
            });
        }
    } catch {
        res.status(400).json({
            error: `Error occurred in updating user with id: ${id}, ${error}`
        });
    }
});

// Delete food from the database using id
app.delete('/user/:id', ensureLogin, async function (req, res) {
    // Get the id
    let id = req.params.id

    // Delete the food
    var result = await dbUser.deleteUserById(id);
    try {
        if (result) {
            res.status(200).json({
                message: result
            });
        } else {
            res.status(404).json({
                error: 'There are no user matches with that ID!'
            });
        }
    } catch {
        res.status(400).json({
            error_message: `Error occurred when deleting a user with id: ${id}, ${error}`
        });
    }
});

// Root
app.get('/', function (req, res) {
    res.send('Menu API');
});

// Add new food document to collection using the body of the request
app.post('/foods', async function (req, res) {
    var newFood = await db.addNewFood(req.body);
    try {
        res.status(201).json({
            message: newFood
        });
    } catch (err) {
        res.status(400).json({
            error: err
        });
    }
})

// Get all food objects
app.get('/foods', async function (req, res) {
    var result = await db.getAllFood();
    try {
        if (result.length > 0) {
            res.status(200).json(result);
        } else {
            res.status(404).json({
                error: 'There is no food!',
            })
        }
    } catch (err) {
        res.status(400).json({
            error: `${err}`
        })
    }
});

// Retrieves food which has a specific id from the database
app.get('/foods/:id', async function (req, res) {
    // Get the id
    let id = req.params.id
    var result = await db.getFoodById(id);

    // Show result or error message
    try {
        if (result) {
            res.status(200).json(result);
        } else {
            res.status(404).json({
                error: 'There are no food matches with that ID!'
            });
        }
    } catch (err) {
        res.status(400).json({
            error: err
        });
    }
});

// Update/overwrite a food in the database using its id
app.put('/foods/:id', async function (req, res) {
    // Get the id
    let id = req.params.id

    // Update the food by using its id
    var result = await db.updateFoodById(req.body, id);
    try {
        if (result) {
            console.log(res);
            res.status(200).json({
                message: result
            });
        } else {
            res.status(404).json({
                error: 'There are no food matches with that ID!'
            });
        }
    } catch {
        res.status(400).json({
            error: `Error occurred in updating food with id: ${id}, ${error}`
        });
    }
});

// Delete food from the database using id
app.delete('/foods/:id', async function (req, res) {
    // Get the id
    let id = req.params.id

    // Delete the food
    var result = await db.deleteFoodById(id);
    try {
        if (result) {
            res.status(200).json({
                message: result
            });
        } else {
            res.status(404).json({
                error: 'There are no food matches with that ID!'
            });
        }
    } catch {
        res.status(400).json({
            error_message: `Error occurred when deleting a food with id: ${id}, ${error}`
        });
    }
});

//add a new subscriber to the newsletter
app.post('/newsletter', async function (req, res) {
    var newSub = await newsdb.addNewSubscriber(req.body)

    // Show result or error message
    try {
        res.status(201).json({
            message: newSub
        });
    } catch (err) {
        res.status(400).json({
            error: err
        });
    }
})

//get all subscribers
app.get('/newsletter', async function (req, res) {
    var result = await newsdb.getAllSubscribers();

    // Show result or error message
    try {
        if (result.length > 0) {
            res.status(200).json(result);
        } else {
            res.status(404).json({
                error: 'There is no Subscriber!',
            })
        }
    } catch (err) {
        res.status(400).json({
            error: `${err}`
        })
    }
});

//add a new booking/reservation
app.post('/bookings', async function (req, res) {
    var newBooking = await bookingdb.addBooking(req.body);

    // Show result or error message
    try {
        res.status(201).json({
            message: newBooking
        });
    } catch (err) {
        res.status(400).json({
            error: err
        });
    }
})

//get all reservations
app.get('/bookings', async function (req, res) {
    var result = await bookingdb.getAllBookings();

    // Show result or error message
    try {
        if (result.length > 0) {
            res.status(200).json(result);
        } else {
            res.status(404).json({
                error: 'There is no Subscriber!',
            })
        }
    } catch (err) {
        res.status(400).json({
            error: `${err}`
        })
    }
});

app.post('/contact', async function(req, res){
    const {fname, lname, email, subject} = req.body

    const message = "From " + email + " "+fname + " " + lname + " " + subject
    const response = await SendEmail(email, 'Inquiry', message);
    if (response == "Successful") {
        res
            .status(201)
            .json({ message: "Email sent!" });
    }
    else {
        return res.status(404).json({ errors: "Unable to send email" });
    }
})

// Delete a booking/reservation from the database
app.delete('/bookings', ensureLogin, async function (req, res) {
    var result = await bookingdb.deleteBooking(req.body)
    try {
        if (result) {
            res.status(200).json({
                message: result
            });
        } else {
            res.status(404).json({
                error: 'There are no booking!'
            });
        }
    } catch {
        res.status(400).json({
            error_message: `Error occurred when deleting the booking`
        });
    }
});

// Check if user is authenticated
function ensureLogin(req, res, next) {

    if (req.session.user) {
        token = req.session.user.myToken
        jwt.verify(token, process.env.ACCESS_TOKEN, function (err, decoded) {

            if (err) {
                console.log('error')
                res.send(err);
            } else {
                next();
            }
        });

    } else {
        res.send("you did not login!");

    }


}

app.listen(port, () => {
    console.log(`App listening on: ${port}`);
});