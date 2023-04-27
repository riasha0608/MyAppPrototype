CREATE TABLE clothing (
    id INT NOT NULL AUTO_INCREMENT,
    colorDescription VARCHAR (150) NULL,
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