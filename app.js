const DEBUG = true;

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

// Configure Express to parse URL-encoded POST request bodies (traditional forms)
app.use( express.urlencoded({ extended: false }) );

// define middleware that logs all incoming requests
app.use(logger("dev"));

app.use(express.static(__dirname + '/public'));

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

const read_categories_all_sql = `
    SELECT
        categoriesID, categoriesName
    FROM
        categories
    WHERE 
        userid = ?
`

// define a route for the stuff inventory page
//JOIN categories
//ON clothing.categoriesID = categories.categoriesID
const read_clothing_all_sql = `
    SELECT
        id, colorDescription, placeBought, categoriesName,
        clothing.categoriesID as categoriesID,
        quantity
    FROM clothing
    JOIN categories
        ON clothing.categoriesID = categories.categoriesID
    WHERE clothing.userid = ?
    ORDER BY clothing.id DESC
`
app.get( "/clothing", requiresAuth(), ( req, res ) => {
    db.execute(read_clothing_all_sql, [req.oidc.user.email], (error, results) => {
        if (DEBUG)
            console.log(error ? error : results);
        if (error)
            res.status(500).send(error); //Internal Server Error
        else {
            db.execute(read_categories_all_sql, [req.oidc.user.email], (error2, results2) => {
                if (DEBUG)
                    console.log(error2 ? error2 : results2);
                if (error2)
                    res.status(500).send(error2);
                else {
                    let data = {clothinglist: results, categorieslist: results2};
                    res.render('clothing', data);
                }
            });
        }
    });
});

const read_clothing_detail_sql = `
    SELECT
        id, colorDescription, placeBought, categoriesName, 
        clothing.categoriesID as categoriesID,
        quantity, 
        description
    FROM clothing
    JOIN categories
        ON clothing.categoriesID = categories.categoriesID
    WHERE id = ?
    AND clothing.userid = ?
`

// define a route for the item detail page
app.get( "/clothing/details/:id", requiresAuth(), ( req, res ) => {
    db.execute(read_clothing_detail_sql, [req.params.id, req.oidc.user.email], (error, results) => {
        if (DEBUG)
            console.log(error ? error : results);
        if (error)
            res.status(500).send(error); //Internal Server Error
        else if (results.length == 0)
            res.status(404).send(`No item found with id = "${req.params.id}"` ); // NOT FOUND
        else {
            db.execute(read_categories_all_sql,[req.oidc.user.email], (error2, results2) => {
                if (DEBUG)
                    console.log(error2 ? error2 : results2);
                if (error2)
                    res.status(500).send(error2);
                else {
                    let data = {clothing: results[0], categorieslist: results2};
                    res.render('details', data);
                }
            });
        }
    });
});

const create_clothing_sql = `
    INSERT INTO clothing
        (colorDescription, placeBought, categoriesID, quantity, userid)
    VALUES
        (?, ?, ?, ?, ?);
`

app.post("/clothing", requiresAuth(), ( req, res ) => {
    db.execute(create_clothing_sql, [req.body.colorDescription, req.body.placeBought, req.body.category, req.body.quantity, req.oidc.user.email], (error, results) => {
        if (DEBUG)
            console.log(error ? error : results);
        if (error)
            res.status(500).send(error);
        else {
            res.redirect(`/clothing/details/${results.insertId}`)
        }
    })
})

const update_clothing_sql = `
    UPDATE
        clothing
    SET
        colorDescription = ?,
        placeBought = ?,
        categoriesID = ?,
        quantity = ?,
        description = ?
    WHERE
        id = ?
    AND
        userid = ?
`

app.post("/clothing/details/:id", (req, res) => {
    db.execute(update_clothing_sql, [req.body.colorDescription, req.body.placeBought, req.body.category, req.body.quantity, req.body.description, req.params.id, req.oidc.user.email], (error, results) => {
        if (DEBUG)
            console.log(error ? error : results);
        if (error) 
            res.status(500).send(error);
        else {
            res.redirect(`/clothing/details/${req.params.id}`);
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
        if (DEBUG)
            console.log(error ? error : results);
        if (error)
            res.status(500).send(error); //Internal Server Error
        else {
            res.redirect("/clothing");
        }
    });
});

const read_categories_all_alphabetical_sql = `
    SELECT 
        categoriesID, categoriesName
    FROM
        categories
    WHERE
        userid = ?
    ORDER BY
        categoriesName ASC
`

app.get('/categories', requiresAuth(), (req, res) => {
    db.execute(read_categories_all_alphabetical_sql, [req.oidc.user.email], (error, results) => {
        if (DEBUG)
            console.log(error ? error : results);
        if (error)
            res.status(500).send(error);
        else {
            res.render("categories", {categorieslist: results});
        }
    });
});

const create_category_sql = `
    INSERT INTO categories
        (categoriesName, userid)
    VALUES
        (?, ?)
`

app.post('/categories', requiresAuth(), (req, res) => {
    db.execute(create_category_sql, [req.body.categoriesName, req.oidc.user.email], (error, results) => {
        if (DEBUG)
            console.log(error ? error: results);
        if (error)
            res.status(500).send(error);
        else {
            res.redirect("/categories");
        }
    });
});

const delete_category_sql = `
    DELETE
    FROM
        categories
    WHERE
        categoriesID = ?
        AND userid = ?
`

app.get("/categories/:id/delete", requiresAuth(), (req, res) => {
    db.execute(delete_category_sql, [req.params.id, req.oidc.user.email], (error, results) => {
        if (DEBUG)
            console.log(error ? error : results);
        if (error) {
            if (error.code == "ER_ROW_IS_REFERENCED_2") {
                res.status(500).send("There are clothing items still associated with that category!")
            }
            else
                res.status(500).send(error);
        }
        else {
            res.redirect("/categories");
        }
    })
})

// // define a route for item Create
// const create_clothing_sql = `
//     INSERT INTO clothing
//         (category, colorDescription, placeBought, quantity, userid)
//     VALUES
//         (?, ?, ?, ?, ?)
// `
// app.post("/clothing", requiresAuth(), ( req, res ) => {
//     db.execute(create_clothing_sql, [req.body.categories, req.body.colorDescrip, req.body.place, req.body.quantity, req.oidc.user.email], (error, results) => {
//         if (error)
//             res.status(500).send(error); //Internal Server Error
//         else {
//             //results.insertId has the primary key (id) of the newly inserted element.
//             res.redirect(`/clothing/details/${results.insertId}`);
//         }
//     });
// })

// define a route for item UPDATE
// const update_clothing_sql = `
//     UPDATE
//         clothing
//     SET
//         colorDescription = ?,
//         placeBought = ?,
//         quantity = ?,
//         description = ?
//     WHERE
//         id = ?
//     AND
//         userid = ?
// `
// app.post("/clothing/details/:id", requiresAuth(), ( req, res ) => {
//     db.execute(update_clothing_sql, [req.body.colorDescrip, req.body.place, req.body.quantity, req.body.description, req.params.id, req.oidc.user.email], (error, results) => {
//         if (error)
//             res.status(500).send(error); //Internal Server Error
//         else {
//             res.redirect(`/clothing/details/${req.params.id}`);
//         }
//     });
// })

// start the server
app.listen( port, () => {
    console.log(`App server listening on ${ port }. (Go to http://localhost:${ port })` );
} );