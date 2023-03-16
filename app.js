//set up the server
const express = require( "express" );
const logger = require("morgan");
const { auth } = require('express-openid-connect');
const { requiresAuth } = require('express-openid-connect');
const dotenv = require('dotenv');
dotenv.config();

const helmet = require("helmet");
const db = require('./db/db_pool');
const app = express();
const port = process.env.PORT || 8080;

// Configure Express to use EJS
app.set( "views",  __dirname + "/views");
app.set( "view engine", "ejs" );

//Configure Express to use certain HTTP headers for security
//Explicitly set the CSP to allow certain sources
app.use(helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'", 'cdnjs.cloudflare.com']
      }
    }
})); 

// CODE FROM AUTH0:
const config = {
    authRequired: false,
    auth0Logout: true,
    secret: process.env.AUTH0_SECRET,
    baseURL: process.env.AUTH0_BASE_URL,
    clientID: process.env.AUTH0_CLIENT_ID,
    issuerBaseURL: process.env.AUTH0_ISSUER_BASE_URL
  };
  
// auth router attaches /login, /logout, and /callback routes to the baseURL
app.use(auth(config));

// Configure Express to parse URL-encoded POST request bodies (traditional forms)
app.use( express.urlencoded({ extended: false }) );

  // define middleware that logs all incoming requests
app.use(logger("dev"));
app.use(express.static(__dirname + '/public'));

app.use((req, res, next) => {
    res.locals.isLoggedIn = req.oidc.isAuthenticated();
    res.locals.user = req.oidc.user;
    next();
})

// req.isAuthenticated is provided from the auth router
app.get('/authtest', (req, res) => {
    res.send(req.oidc.isAuthenticated() ? 'Logged in' : 'Logged out');
});

app.get('/profile', requiresAuth(), (req, res) => {
    res.send(JSON.stringify(req.oidc.user));
});

// define a route for the default home page
app.get( "/", ( req, res ) => {
    res.render('index');
});

// define a route for the stuff inventory page
const read_clothing_all_sql = `
    SELECT 
        id, category, colorDescription, placeBought, quantity
    FROM
        clothing
    WHERE
        userid = ?
`
app.get( "/clothing", requiresAuth(), ( req, res ) => {
    db.execute(read_clothing_all_sql, [req.oidc.user.email], (error, results) => {
        if (error)
            res.status(500).send(error); //Internal Server Error
        else
            res.render('clothing', { inventory : results });
    });
});

// define a route for the item detail page
const read_clothing_sql = `
    SELECT 
        id, category, colorDescription, placeBought, quantity, description 
    FROM
        clothing
    WHERE
        id = ?
    AND
        userid = ?
`
// define a route for the item detail page
app.get( "/clothing/details/:id", requiresAuth(), ( req, res ) => {
    db.execute(read_clothing_sql, [req.params.id, req.oidc.user.email], (error, results) => {
        if (error)
            res.status(500).send(error); //Internal Server Error
        else if (results.length == 0)
            res.status(404).send(`No item found with id = "${req.params.id}"` ); // NOT FOUND
        else {
            let data = results[0]; // results is still an array
            // data's object structure: 
            //  { item: ___ , quantity:___ , description: ____ }
            res.render('details', data);
        }
    });
});

// define a route for item DELETE
const delete_clothing_sql = `
    DELETE 
    FROM
        clothing
    WHERE
        id = ?
    AND
        userid = ?
`
app.get("/clothing/details/:id/delete", requiresAuth(), ( req, res ) => {
    db.execute(delete_clothing_sql, [req.params.id, req.oidc.user.email], (error, results) => {
        if (error)
            res.status(500).send(error); //Internal Server Error
        else {
            res.redirect("/clothing");
        }
    });
})

// define a route for item Create
const create_clothing_sql = `
    INSERT INTO clothing
        (category, colorDescription, placeBought, quantity, userid)
    VALUES
        (?, ?, ?, ?, ?)
`
app.post("/clothing", requiresAuth(), ( req, res ) => {
    db.execute(create_clothing_sql, [req.body.categories, req.body.colorDescrip, req.body.place, req.body.quantity, req.oidc.user.email], (error, results) => {
        if (error)
            res.status(500).send(error); //Internal Server Error
        else {
            //results.insertId has the primary key (id) of the newly inserted element.
            res.redirect(`/clothing/details/${results.insertId}`);
        }
    });
})

// define a route for item UPDATE
const update_clothing_sql = `
    UPDATE
        clothing
    SET
        colorDescription = ?,
        placeBought = ?,
        quantity = ?,
        description = ?
    WHERE
        id = ?
    AND
        userid = ?
`
app.post("/clothing/details/:id", requiresAuth(), ( req, res ) => {
    db.execute(update_clothing_sql, [req.body.colorDescrip, req.body.place, req.body.quantity, req.body.description, req.params.id, req.oidc.user.email], (error, results) => {
        if (error)
            res.status(500).send(error); //Internal Server Error
        else {
            res.redirect(`/clothing/details/${req.params.id}`);
        }
    });
})

// start the server
app.listen( port, () => {
    console.log(`App server listening on ${ port }. (Go to http://localhost:${ port })` );
} );