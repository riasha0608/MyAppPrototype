//set up the server
const db = require('./db/db_connection');
const express = require( "express" );
const logger = require("morgan");
const app = express();
const port = 8080;

// Configure Express to use EJS
app.set( "views",  __dirname + "/views");
app.set( "view engine", "ejs" );

// define middleware that logs all incoming requests
app.use(logger("dev"));
app.use(express.static(__dirname + '/public'));

// Configure Express to parse URL-encoded POST request bodies (traditional forms)
app.use( express.urlencoded({ extended: false }) );

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
`
app.get( "/clothing", ( req, res ) => {
    db.execute(read_clothing_all_sql, (error, results) => {
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
`
// define a route for the item detail page
app.get( "/clothing/details/:id", ( req, res ) => {
    db.execute(read_clothing_sql, [req.params.id], (error, results) => {
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
`
app.get("/clothing/details/:id/delete", ( req, res ) => {
    db.execute(delete_clothing_sql, [req.params.id], (error, results) => {
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
        (category, colorDescription, placeBought, quantity)
    VALUES
        (?, ?, ?, ?)
`
app.post("/clothing", ( req, res ) => {
    db.execute(create_clothing_sql, [req.body.categories, req.body.colorDescrip, req.body.place, req.body.quantity], (error, results) => {
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
`
app.post("/clothing/details/:id", ( req, res ) => {
    db.execute(update_clothing_sql, [req.body.colorDescrip, req.body.place, req.body.quantity, req.body.description, req.params.id], (error, results) => {
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