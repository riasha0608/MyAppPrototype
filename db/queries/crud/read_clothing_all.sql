SELECT
    id, colorDescription, placeBought, categoriesName,
    clothing.categoriesID as categoriesID,
    quantity
FROM clothing
JOIN categories
    ON clothing.categoriesID = categories.categoriesID
WHERE clothing.userid = ?
ORDER BY clothing.id DESC