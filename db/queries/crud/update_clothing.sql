UPDATE
    clothing
SET
    colorDescription = ?,
    placeBought = ?,
    categoriesID = ?,
    quantity = ?,
    description = ?,
WHERE
    id = ?
AND 
    userid = ?