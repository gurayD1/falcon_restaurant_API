// Import all required modules
require('dotenv').config()
var express = require('express');
const jwt = require('jsonwebtoken')
const session = require('express-session');
const bcrypt = require('bcryptjs');
var bodyParser = require('body-parser'); // pull information from HTML POST (express4)
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
const Reviews = require('./models/reviews');
const SendEmail = require('./utils/SendEmail')
const db = new Menu();
const dbUser = new User();
const newsdb = new Newsletter();
const bookingdb = new Booking();
const reviewsdb = new Reviews();

db.initialize(connectionString);
dbUser.changeModel();
newsdb.initialize(connectionString);
bookingdb.initialize(connectionString);
reviewsdb.initialize(connectionString);
//dbUser.initialize(connectionString);


app.use(bodyParser.json())
app.use(bodyParser.urlencoded({
    'extended': 'false'
}));

app.use(cors());
app.use(express.static('views'));

//var token;

// Configure session
// app.use(session({
//     secret: 'secretdb_groupproject_sshhhhh99281',
//     saveUninitialized: true,
//     resave: true
// }));

// Routes, post request
// Login to API to use it
app.post('/login', async function (req, res) {

    var email1 = req.body.email;
    var password = req.body.password;

    try {
        var user = await dbUser.getUserByUserEmail(email1);

        if (user) {

            const isMatch = await bcrypt.compare(password, user.password);
            if (!isMatch) {
                return res.status(400).json({
                    errors: 'password is not correct'
                });
            }
            if (isMatch) {



                const payload = {
                    user: {
                        id: user.id,
                        email: user.email,
                    },
                };


                jwt.sign(
                    payload,
                    process.env.ACCESS_TOKEN, {
                        expiresIn: 36000
                    },
                    (err, token) => {
                        if (err) throw err;
                        res.json({
                            token
                        });
                    }
                );


            }

        } else {
            return res.status(400).json({
                errors: 'user not found'
            });
        }
    } catch (err) {
        console.log(err.message);
        return res.status(500).json({
            error: 'Server error'
        });
    }
});

// Routes, get request
// Login to API to use it
//http://localhost:3000/login?email=admin@email.com&password=1234
// app.get('/login', async function (req, res) {

//     var email1 = req.query.email;
//     var password = req.query.password;

//     var user = await dbUser.getUserByUserEmail(email1);

//     if (user) {
//         if (user.password === password) {
//             const userInfo = {
//                 email: email1,
//                 pswd: password
//             }

//             token = jwt.sign(userInfo, process.env.ACCESS_TOKEN)
//             req.session.user = {
//                 myToken: token
//             };

//             // console.log(req.session.user)
//             res.send("Email and password is correct")

//         } else {
//             token = ""
//             req.session.user = {
//                 myToken: token
//             };
//             res.send("Password is not correct")
//         }

//     } else {
//         token = ""
//         req.session.user = {
//             myToken: token
//         };
//         res.send("User not found!")
//     }
// });

// Log a user out by destroying their session and redirecting them to /login
// app.get("/logout", function (req, res) {
//     req.session.destroy();
//     res.send("You are now logged out.")
//     // res.redirect("/login");
// });

// Create a new user
app.post('/registration', async function (req, res) {
    let email1 = req.body.email
    try {

        console.log(email1)
        var user1 = await dbUser.getUserByUserEmail(email1);


        if (user1) {
            console.log(user1)
            return res.status(400).json({
                errors: 'User already exist'
            });
        }else{
            console.log("you can register")
        }

       const salt = await bcrypt.genSalt(10);
       console.log(salt)
       console.log(req.body.password)
        const password = await bcrypt.hash(req.body.password, salt);
        console.log(password)
        req.body.password = password

        // const newUser = new User({
        //   name: req.body.name,
        //   email: req.body.email,
        //   password: password,
        // });
        // await newUser.save();

        var newUser = await dbUser.addNewUser(req.body);


        const payload = {
            user: {
                id: newUser.id,
                email: newUser.email,
            },
        };


        //   jwt.verify(token, process.env.ACCESS_TOKEN, function (err, decoded) 

        jwt.sign(
            payload,
            process.env.ACCESS_TOKEN, {
                expiresIn: 36000
            },
            (err, token) => {
                if (err) throw err;
                res.json({
                    token
                });
            }
        );
    } catch (err) {
        console.log(err.message);
        return res.status(500).json({
            error: 'Server error'
        });
    }

    // var newUser = await dbUser.addNewUser(req.body);


    // try {
    //     res.status(201).json({
    //         message: newUser
    //     });
    // } catch (err) {
    //     res.status(400).json({
    //         error: err
    //     });
    // }

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

app.post('/contact', async function (req, res) {
    const {
        fname,
        lname,
        email,
        subject
    } = req.body

    //send inquiry to host 
    const message = "From " + email + " " + fname + " " + lname + " " + subject
    const response = await SendEmail('Inquiry', message, "temmitayolawal35@gmail.com");
 
    //send confirmation of inquiry sent
    const recievedInquiry = `<p>Do not respond to this email.</p> <p>We have recieved your inquiry ${fname}.</p>
    <p>We will get back to you as soon as possible.</p>`
    const updateSent = await SendEmail( 'Inquiry', recievedInquiry, email);
    if (response == "Successful" && updateSent == "Successful") {
        res
            .status(201)
            .json({
                message: "Email sent!"
            });
    } else {
        return res.status(404).json({
            errors: "Unable to send email"
        });
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

// Get all reviews
app.get('/reviews', async function (req, res) {
    var result = await reviewsdb.getAllReviews();
    try {
        if (result.length > 0) {
            res.status(200).json(result);
        } else {
            res.status(404).json({
                error: 'There are no reviews!',
            })
        }
    } catch (err) {
        res.status(400).json({
            error: `${err}`
        })
    }
});

// Add new reviews document to collection using the body of the request
app.post('/reviews', async function (req, res) {
    var newReview = await reviewsdb.addNewReview(req.body);
    try {
        res.status(201).json({
            message: newReview
        });
    } catch (err) {
        res.status(400).json({
            error: err
        });
    }
})

// Delete review from the database using id
app.delete('/reviews/:id', async function (req, res) {
    // Get the id
    let id = req.params.id

    // Delete the review
    var result = await reviewsdb.deleteReviewById(id);
    try {
        if (result) {
            res.status(200).json({
                message: result
            });
        } else {
            res.status(404).json({
                error: 'There are no review matches with that ID!'
            });
        }
    } catch {
        res.status(400).json({
            error_message: `Error occurred when deleting a review with id: ${id}, ${error}`
        });
    }
});


// Check if user is authenticated
function ensureLogin(req, res, next) {


    const token = req.header('x-auth-token');
    console.log(token)

  if (!token) {
    return res
      .status(400)
      .json({ error: 'no token found, authorization denied' });
  }

  try {
    const decoded = jwt.verify(token, process.env.ACCESS_TOKEN);
    console.log(decoded);
    req.user = decoded.user;
    next();
  } catch (err) {
    return res.status(400).json({ error: 'token is not valid' });
  }

    // if (req.session.user) {
    //     token = req.session.user.myToken
    //     jwt.verify(token, process.env.ACCESS_TOKEN, function (err, decoded) {

    //         if (err) {
    //             console.log('error')
    //             res.send(err);
    //         } else {
    //             next();
    //         }
    //     });

    // } else {
    //     res.send("you did not login!");

    // }


}

app.listen(port, () => {
    console.log(`App listening on: ${port}`);
});