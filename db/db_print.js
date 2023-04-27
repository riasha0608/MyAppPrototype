const db = require("./db_connection");

const select_categories_sql = "SELECT * FROM categories";

db.execute(select_categories_sql,
    (error, results) => {
        if (error)
            throw error;
        
        console.log("Table 'categories' contents:")
        console.log(results);
    }
);

const select_clothing_sql = `
SELECT *
FROM clothing
JOIN categories
    ON clothing.categoriesID = categories.categoriesID
ORDER BY 
    clothing.id;
`;

db.execute(select_clothing_sql,
    (error, results) => {
        if (error)
            throw error;
        
        console.log("Table 'clothing' contents:")
        console.log(results);
    }
);

db.end();