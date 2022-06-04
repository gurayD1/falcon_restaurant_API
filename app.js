// Import all required modules
require('dotenv').config()
var express = require('express');
<<<<<<< HEAD
var bodyParser = require('body-parser'); // pull information from HTML POST (express4)
const jwt = require('jsonwebtoken')
const session = require('express-session');
=======
var bodyParser = require('body-parser');         // pull information from HTML POST (express4)
let cors = require('cors');
>>>>>>> 9beaa6bfecc347b245155ad3e705fd09f9c9a90c

// Initialize express app
var port = process.env.PORT || 3000;
var app = express();

// Configure the database
var dbConfig = require('./config/database');
const connectionString = dbConfig.url;
const Menu = require('./models/menu');
const User = require('./models/users');
const db = new Menu();
const dbUser = new User();

db.initialize(connectionString);
<<<<<<< HEAD
dbUser.changeModel();
//dbUser.initialize(connectionString);

app.use(bodyParser.urlencoded({
    'extended': 'true'
}));

var token;

// Configure session
app.use(session({
    secret: 'secretdb_groupproject_sshhhhh99281',
    saveUninitialized: true,
    resave: true
}));


// Routes, post request
// login to api to use it
// app.post('/login', function (req, res) {
//     var userName = req.body.userName;
//     var password = req.body.password;

//     if (userName === process.env.UNAME && password === process.env.UPASSWORD) {
//         const user = {
//             uname: userName,
//             pswd: password
//         }

//         token = jwt.sign(user, process.env.ACCESS_TOKEN)
//         req.session.user = {
//             myToken: token
//         };

//         res.json("you logged in successfully")
//     } else {
//         token = "";
//         req.session.user = {
//             myToken: token
//         };
//         res.send(' username or password is not correct');
//     }

// })

// app.get('/login', function (req, res) {

//     var email = req.query.email;
//     var password = req.query.password;
//     getUserByUserEmail

//   //  var user = await dbUser.getUserByUserEmail(email);


//     if (userName === process.env.UNAME && password === process.env.UPASSWORD) {
//         const user = {
//             uname: userName,
//             pswd: password
//         }

//         token = jwt.sign(user, process.env.ACCESS_TOKEN)
//         req.session.user = {
//             myToken: token
//         };

//         res.json("you logged in successfully")
//     } else {
//         token = "";
//         req.session.user = {
//             myToken: token
//         };
//         res.send('username or password is not correct');
//     }

// });


//routes, post request
// login to API to use it
app.post('/login', async function (req, res) {

    var email1 = req.body.email;
    var password = req.body.password;

   var user = await dbUser.getUserByUserEmail(email1);

    if(user){
        if(user.password ===password ){
            res.send("email and password is correct")

            const userInfo = {
                email: email1,
                pswd: password
            }
    
            token = jwt.sign(userInfo, process.env.ACCESS_TOKEN)
            req.session.token = token
            req.session.user = {
                myToken: token
            };


        }else{
            res.send("password is not correct")
            token = ""
            req.session.user = {
                myToken: token
            };
        }
      
    }else{
        res.send("not found")
        token = ""
        req.session.user = {
            myToken: token
        };
    }


});



//routes, get request
// login to API to use it
//http://localhost:3000/login?email=admin@email.com&password=1234
app.get('/login', async function (req, res) {

    var email1 = req.query.email;
    var password = req.query.password;

    var user = await dbUser.getUserByUserEmail(email1);

    if(user){
        if(user.password ===password ){
            res.send("email and password is correct")

            const userInfo = {
                email: email1,
                pswd: password
            }
    
            token = jwt.sign(userInfo, process.env.ACCESS_TOKEN)
            req.session.user = {
                myToken: token
            };

            console.log(req.session.user)


        }else{
            res.send("password is not correct")
            token = ""
            req.session.user = {
                myToken: token
            };
        }
      
    }else{
        res.send("not found")
        token = ""
        req.session.user = {
            myToken: token
        };
    }


});



// Log a user out by destroying their session and redirecting them to /login
app.get("/logout", function (req, res) {
    req.session.destroy();
    res.send("you logged out")
   // res.redirect("/login");
});

//routes
// create a new user
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

//routes
// Get all users
app.get('/allusers', ensureLogin, async function (req, res) {

    var result = await dbUser.getAllUsers();
    try {
        if (result.length > 0) {
            res.status(200).json(result);
        } else {
            res.status(404).json({
                error: 'There is no users!',
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



=======
app.use(bodyParser.urlencoded({ 'extended': 'true' }));
app.use(cors());
app.use(express.static('views'));
>>>>>>> 9beaa6bfecc347b245155ad3e705fd09f9c9a90c

// Routes
app.get('/', function (req, res) {
    res.send('Menu API');
});

// Add new food document to collection using the body of the request
app.post('/foods', ensureLogin, async function (req, res) {
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
app.get('/foods', ensureLogin, async function (req, res) {
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
app.get('/foods/:id', ensureLogin, async function (req, res) {
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
app.put('/foods/:id', ensureLogin, async function (req, res) {
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
app.delete('/foods/:id', ensureLogin, async function (req, res) {
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


// Check if user is authenticated
function ensureLogin(req, res, next) {
    console.log(req.session.userInfo)
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
        //res.redirect("/login");
    }

    console.log( req.session.token)
}

app.listen(port, () => {
    console.log(`App listening on: ${port}`);
});