SELECT *
FROM clothing
JOIN categories
    ON clothing.categoriesID = categories.categoriesID
ORDER BY
    clothing.id;