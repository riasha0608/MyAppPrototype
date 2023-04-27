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