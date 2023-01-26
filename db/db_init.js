// (Re)Sets up the database, including a little bit of sample data
const db = require("./db_connection");

/**** Delete existing table, if any ****/

const drop_clothing_table_sql = "DROP TABLE IF EXISTS `clothing`;"

db.execute(drop_clothing_table_sql);

const create_clothing_table_sql = `
    CREATE TABLE clothing (
        id INT NOT NULL AUTO_INCREMENT,
        category VARCHAR(45) NOT NULL,
        colorDescription VARCHAR (150) NOT NULL,
        placeBought VARCHAR (150) NOT NULL,
        quantity INT NOT NULL,
        description VARCHAR(150) NULL,
        PRIMARY KEY (id)
    );
`
db.execute(create_clothing_table_sql);

/**** Create some sample items ****/

const insert_clothing_table_sql = `
    INSERT INTO clothing 
        (category, colorDescription, placeBought, quantity, description) 
    VALUES 
        (?, ?, ?, ?, ?);
`
db.execute(insert_clothing_table_sql, ['Jeans', 'Black, ripped, wide-leg', 'Zara', '1', 'Made of denim... Stretchy waistband... Made in USA... Purchased on: July 7th, 2022']);

db.execute(insert_clothing_table_sql, ['Sleeveless shirt/tank top', 'White, long', 'Target', '2', null]);

db.execute(insert_clothing_table_sql, ['T-shirt', 'Thingymabob', 'ThingyStore', '100', 'Not to be confused with a Thingamabob']);

/**** Read the sample items inserted ****/

const read_clothing_table_sql = "SELECT * FROM clothing";

db.execute(read_clothing_table_sql, 
    (error, results) => {
        if (error) 
            throw error;

        console.log("Table 'clothing' initialized with:")
        console.log(results);
    }
);

db.end();