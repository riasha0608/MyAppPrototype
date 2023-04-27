const db = require("./db_connection");

/**** Delete *CONTENTS OF* existing tables (but not dropping tables themselves) ****/

const delete_clothing_table_sql = "DELETE FROM clothing;"

db.execute(delete_clothing_table_sql);

const delete_categories_table_sql = "DELETE FROM categories;"

db.execute(delete_categories_table_sql);

const insert_category_sql = `
    INSERT INTO categories
        (categoriesID, categoriesName)
    VALUES
        (?, ?);
`

db.execute(insert_category_sql, [1, 'Jeans']);
db.execute(insert_category_sql, [2, 'Sweaters']);
db.execute(insert_category_sql, [3, 'T-shirt']);
db.execute(insert_category_sql, [4, 'Blouse']);

const insert_clothing_sql = `
    INSERT INTO clothing 
        (colorDescription, placeBought, categoriesID, quantity, description)
    VALUES
        (?, ?, ?, ?, ?);
`

db.execute(insert_clothing_sql, ['Black, wide-leg', 'Zara', 1, 2, null]);

db.execute(insert_clothing_sql, ['Bright red, Christmas theme', 'Nike', 3, 1, 'Super comfortable!']);

db.execute(insert_clothing_sql, ['Polka dots:)', 'Neiman Marcus', 2, 3, null]);

db.execute(insert_category_sql, [5, 'Sweatpants']);

db.execute(insert_category_sql, [6, 'Shorts']);

db.execute(insert_clothing_sql, ['White, ripped', 'Princess Polly', 1, 4, 'Made of denim and polyester']);

db.execute(insert_clothing_sql, ['Pink!', 'H&M', 4, 1, 'Very long sleeves']);

db.execute(insert_clothing_sql, ['Light gray', 'Nike', 5, 2, null]);

db.execute(insert_clothing_sql, ['Yellow:)', 'Lululemon', 6, 5, null]);

db.end();