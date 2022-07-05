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
const Faq = require('./models/faq');
const About = require('./models/about');
const Image = require('./models/images');
const Menu = require('./models/menu');
const User = require('./models/users');
const Newsletter = require('./models/newsletter');
const Booking = require('./models/booking');
const Reviews = require('./models/reviews');
const Order = require('./models/orders');
const SendEmail = require('./utils/SendEmail')
const db = new Menu();
const dbUser = new User();
const newsdb = new Newsletter();
const bookingdb = new Booking();
const reviewsdb = new Reviews();
const ordersdb = new Order();
const dbfaq = new Faq();
const dbabout = new About();
const dbimage = new Image();

db.initialize(connectionString);
dbUser.changeModel();
newsdb.initialize(connectionString);
bookingdb.initialize(connectionString);
reviewsdb.initialize(connectionString);
ordersdb.initialize(connectionString);
dbfaq.initialize(connectionString);
dbabout.initialize(connectionString);
dbimage.initialize(connectionString);
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
                        accountType: user.accountType
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
                accountType: newUser.accountType
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

// Get all faq objects
app.get('/faq', async function (req, res) {
    var result = await dbfaq.getAllFaq();
    try {
        if (result.length > 0) {
            res.status(200).json(result);
        } else {
            res.status(404).json({
                error: 'There is no faq!',
            })
        }
    } catch (err) {
        res.status(400).json({
            error: `${err}`
        })
    }
});

app.post('/faq', async function (req, res) {
   
    var newFaq = await dbfaq.addNewFaq(req.body);
     try {
         res.status(201).json({
             message: newFaq
         });
     } catch (err) {
         res.status(400).json({
             error: err
         });
     }
 })

 app.get('/faq/:id', async function (req, res) {
    // Get the id
    let id = req.params.id
    var result = await dbfaq.getFaqById(id);

    // Show result or error message
    try {
        if (result) {
            res.status(200).json(result);
        } else {
            res.status(404).json({
                error: 'There are no faq matches with that ID!'
            });
        }
    } catch (err) {
        res.status(400).json({
            error: err
        });
    }
});

app.delete('/faq/:id', async function (req, res) {
    // Get the id
    let id = req.params.id

    // Delete the faq
    var result = await dbfaq.deleteFaqById(id);
    try {
        if (result) {
            res.status(200).json({
                message: result
            });
        } else {
            res.status(404).json({
                error: 'There are no faq matches with that ID!'
            });
        }
    } catch {
        res.status(400).json({
            error_message: `Error occurred when deleting a faq with id: ${id}, ${error}`
        });
    }
});

app.delete('/deletefaq/:id', async function (req, res) {
    // Get the id
    let id = req.params.id

    // Delete the faq
    var result = await dbfaq.deleteFaqByMongoId(id);
    try {
        if (result) {
            res.status(200).json({
                message: result
            });
        } else {
            res.status(404).json({
                error: 'There are no faq matches with that ID!'
            });
        }
    } catch {
        res.status(400).json({
            error_message: `Error occurred when deleting a faq with id: ${id}, ${error}`
        });
    }
});

/*******************************************/

// Get all image objects
app.get('/images', async function (req, res) {
    var result = await dbimage.getAllImage();
    try {
        if (result.length > 0) {
            res.status(200).json(result);
        } else {
            res.status(404).json({
                error: 'There is no image!',
            })
        }
    } catch (err) {
        res.status(400).json({
            error: `${err}`
        })
    }
});

app.post('/images', async function (req, res) {

    var newImage = await dbimage.addNewImage(req.body);
     try {
         res.status(201).json({
             message: newImage
         });
     } catch (err) {
         res.status(400).json({
             error: err
         });
     }
 })

 app.get('/images/:id', async function (req, res) {
    // Get the id
    let id = req.params.id
    var result = await dbimage.getImageById(id);

    // Show result or error message
    try {
        if (result) {
            res.status(200).json(result);
        } else {
            res.status(404).json({
                error: 'There are no image matches with that ID!'
            });
        }
    } catch (err) {
        res.status(400).json({
            error: err
        });
    }
});

app.delete('/images/:id', async function (req, res) {
    // Get the id
    let id = req.params.id

    // Delete the image
    var result = await dbimage.deleteImageById(id);
    try {
        if (result) {
            res.status(200).json({
                message: result
            });
        } else {
            res.status(404).json({
                error: 'There are no image matches with that ID!'
            });
        }
    } catch {
        res.status(400).json({
            error_message: `Error occurred when deleting a image with id: ${id}, ${error}`
        });
    }
});

app.delete('/deleteimage/:id', async function (req, res) {
    // Get the id
    let id = req.params.id

    // Delete the image
    var result = await dbimage.deleteImageByMongoId(id);
    try {
        if (result) {
            res.status(200).json({
                message: result
            });
        } else {
            res.status(404).json({
                error: 'There are no image matches with that ID!'
            });
        }
    } catch {
        res.status(400).json({
            error_message: `Error occurred when deleting a image with id: ${id}, ${error}`
        });
    }
});

/**************************************************/

// Get all image objects
app.get('/about', async function (req, res) {
    var result = await dbabout.getAllAbout();
    try {
        if (result.length > 0) {
            res.status(200).json(result);
        } else {
            res.status(404).json({
                error: 'There is no person!',
            })
        }
    } catch (err) {
        res.status(400).json({
            error: `${err}`
        })
    }
});

app.post('/about', async function (req, res) {

    var newAbout = await dbabout.addNewAbout(req.body);
     try {
         res.status(201).json({
             message: newAbout
         });
     } catch (err) {
         res.status(400).json({
             error: err
         });
     }
 })

 app.get('/about/:id', async function (req, res) {
    // Get the id
    let id = req.params.id
    var result = await dbabout.getAboutById(id);

    // Show result or error message
    try {
        if (result) {
            res.status(200).json(result);
        } else {
            res.status(404).json({
                error: 'There are no person matches with that ID!'
            });
        }
    } catch (err) {
        res.status(400).json({
            error: err
        });
    }
});

app.delete('/about/:id', async function (req, res) {
    // Get the id
    let id = req.params.id

    // Delete the person
    var result = await dbabout.deleteAboutById(id);
    try {
        if (result) {
            res.status(200).json({
                message: result
            });
        } else {
            res.status(404).json({
                error: 'There are no person matches with that ID!'
            });
        }
    } catch {
        res.status(400).json({
            error_message: `Error occurred when deleting a person with id: ${id}, ${error}`
        });
    }
});

app.delete('/deleteabout/:id', async function (req, res) {
    // Get the id
    let id = req.params.id

    // Delete the person
    var result = await dbabout.deleteAboutByMongoId(id);
    try {
        if (result) {
            res.status(200).json({
                message: result
            });
        } else {
            res.status(404).json({
                error: 'There are no person matches with that ID!'
            });
        }
    } catch {
        res.status(400).json({
            error_message: `Error occurred when deleting a person with id: ${id}, ${error}`
        });
    }
});

// Add new food document to collection using the body of the request
app.post('/foods', async function (req, res) {
   // var newFood = await db.addNewFood(req.body);
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

app.delete('/deletefoods/:id', async function (req, res) {
    // Get the id
    let id = req.params.id

    // Delete the food
    var result = await db.deleteFoodByMongoId(id);
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

// Get all orders
app.get('/orders', async function (req, res) {
    var result = await ordersdb.getAllOrders();
    try {
        if (result.length > 0) {
            res.status(200).json(result);
        } else {
            res.status(404).json({
                error: 'There are no orders!',
            })
        }
    } catch (err) {
        res.status(400).json({
            error: `${err}`
        })
    }
});

// Retrieves order which has a specific email from the database
app.get('/orders/:email', async function (req, res) {
    // Get the id
    let email = req.params.email
    var result = await ordersdb.getOrderByEmail(email);

    // Show result or error message
    try {
        if (result) {
            res.status(200).json(result);
        } else {
            res.status(404).json({
                error: 'There are no orders with that email!'
            });
        }
    } catch (err) {
        res.status(400).json({
            error: err
        });
    }
});

// Add new order document to collection using the body of the request
app.post('/orders', async function (req, res) {
    var newOrder = await ordersdb.addNewOrder(req.body);
    try {
        res.status(201).json({
            message: newOrder
        });
    } catch (err) {
        res.status(400).json({
            error: err
        });
    }
})

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