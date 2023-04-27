// (Re)Sets up the database, including a little bit of sample data
const db = require("./db_connection");

/**** Drop existing table, if any ****/

const drop_clothing_table_sql = "DROP TABLE IF EXISTS clothing;"

db.execute(drop_clothing_table_sql);

const drop_categories_table_sql = "DROP TABLE IF EXISTS categories;"

db.execute(drop_categories_table_sql);

const create_categories_table_sql = `
    CREATE TABLE categories (
        categoriesID INT NOT NULL AUTO_INCREMENT,
        categoriesName VARCHAR(45) NOT NULL,
        userid VARCHAR (255) NULL,
        PRIMARY KEY (categoriesID));
`
db.execute(create_categories_table_sql);

const create_clothing_table_sql = `
    CREATE TABLE clothing (
        id INT NOT NULL AUTO_INCREMENT,
        colorDescription VARCHAR (150) NOT NULL,
        placeBought VARCHAR (150) NOT NULL,
        categoriesID INT NOT NULL,
        quantity INT NOT NULL,
        description VARCHAR(150) NULL,
        userid VARCHAR(255) NULL,
        PRIMARY KEY (id),
        INDEX clothingCategories_idx (categoriesID ASC),
        CONSTRAINT clothingCategories
            FOREIGN KEY (categoriesID)
            REFERENCES categories (categoriesID)
            ON DELETE RESTRICT
            ON UPDATE CASCADE);
`
db.execute(create_clothing_table_sql);

db.end();