PRAGMA foreign_keys = ON;

--- clear existing schema ---
DROP TABLE IF EXISTS AssetCategories;

DROP TABLE IF EXISTS Assets;

DROP TABLE IF EXISTS Categories;

DROP TABLE IF EXISTS Conditions;

DROP TABLE IF EXISTS Ownerships;

DROP TABLE IF EXISTS Sessions;

DROP TABLE IF EXISTS Statuses;

DROP TABLE IF EXISTS UserRoles;

DROP TABLE IF EXISTS Roles;

DROP TABLE IF EXISTS Users;

--- classificators ---
CREATE TABLE Statuses (
    id INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT CHECK ( id >= 0 ),
    name TEXT NOT NULL UNIQUE CHECK ( LENGTH(TRIM(name)) > 0 )
);

CREATE TABLE Ownerships (
    id INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT CHECK ( id >= 0 ),
    name TEXT NOT NULL UNIQUE CHECK ( LENGTH(TRIM(name)) > 0 )
);

CREATE TABLE Conditions (
    id INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT CHECK ( id >= 0 ),
    name TEXT NOT NULL UNIQUE CHECK ( LENGTH(TRIM(name)) > 0 )
);

CREATE TABLE Categories (
    id INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT CHECK ( id >= 0 ),
    name TEXT NOT NULL UNIQUE CHECK ( LENGTH(TRIM(name)) > 0 )
);

CREATE TABLE Roles (
    id INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT CHECK ( id >= 0 ),
    name TEXT NOT NULL UNIQUE CHECK ( LENGTH(TRIM(name)) > 0 )
);

--- users ---
CREATE TABLE Users (
    id INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT CHECK ( id >= 0 ),
    firstname TEXT NOT NULL CHECK ( LENGTH(TRIM(firstname)) > 0 ),
    lastname TEXT NOT NULL CHECK ( LENGTH(TRIM(lastname)) > 0 ),
    email TEXT NOT NULL CHECK ( email LIKE '%_@__%.__%' ),
    password_hash TEXT NOT NULL CHECK ( LENGTH(TRIM(password_hash)) > 0 ),
    UNIQUE ( email COLLATE NOCASE )
);

CREATE TABLE UserRoles (
    user_id INTEGER NOT NULL REFERENCES Users(id) CHECK ( user_id >= 0 ),
    role_id INTEGER NOT NULL REFERENCES Roles(id) CHECK ( role_id >= 0 )
);

--- sessions ---
CREATE TABLE Sessions (
    id INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT CHECK ( id >= 0 ),
    user_id INTEGER NOT NULL REFERENCES Users(id) CHECK ( user_id >= 0 ),
    expires_at TEXT NOT NULL CHECK ( expires_at BETWEEN '1970-01-01' AND '2100-12-31' )
);

--- assets ---
CREATE TABLE Assets (
    id INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT CHECK ( id >= 0 ),
    name TEXT NOT NULL CHECK ( LENGTH(TRIM(name)) > 0 ),
    description TEXT,
    status_id INTEGER NOT NULL REFERENCES Statuses(id) CHECK ( status_id >= 0 ),
    ownership_id INTEGER NOT NULL REFERENCES Ownerships(id) CHECK ( ownership_id >= 0 ),
    condition_id INTEGER NOT NULL REFERENCES Conditions(id) CHECK ( condition_id >= 0 ),
    acquired_at TEXT NOT NULL CHECK ( acquired_at BETWEEN '1970-01-01' AND '2100-12-31' ),
    acquisition_price INTEGER NOT NULL CHECK ( acquisition_price >= 0 ),
    expected_lifespan INTEGER NOT NULL CHECK ( expected_lifespan >= 0 ),
    image_url TEXT CHECK ( image_url LIKE 'http://%' OR image_url LIKE 'https://%' ),
    created_by_id INTEGER NOT NULL REFERENCES Users(id) CHECK ( created_by_id >= 0 ),
    updated_by_id INTEGER NOT NULL REFERENCES Users(id) CHECK ( updated_by_id >= 0 ),
    deleted_by_id INTEGER REFERENCES Users(id) CHECK ( deleted_by_id >= 0 ),
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP CHECK ( created_at BETWEEN '1970-01-01' AND '2100-12-31' ),
    updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP CHECK ( updated_at BETWEEN '1970-01-01' AND '2100-12-31' ),
    deleted_at TEXT CHECK ( deleted_at BETWEEN '1970-01-01' AND '2100-12-31' )
);

CREATE TABLE AssetCategories (
    asset_id INTEGER NOT NULL REFERENCES Assets(id) CHECK ( asset_id >= 0 ),
    category_id INTEGER NOT NULL REFERENCES Categories(id) CHECK ( category_id >= 0 )
);

--- seed data ---
INSERT INTO Statuses (name) VALUES
                                ('In use'),
                                ('In storage'),
                                ('Under maintenance');

INSERT INTO Ownerships (name) VALUES
                                  ('Owned'),
                                  ('Leased'),
                                  ('Short-term rent'),
                                  ('Long-term rent'),
                                  ('Donated');

INSERT INTO Conditions (name) VALUES
                                  ('Operational'),
                                  ('Requires maintenance'),
                                  ('Damaged');

INSERT INTO Categories (name) VALUES
                                  ('Production equipment'),
                                  ('Storage equipment'),
                                  ('Delivery & Logistics'),
                                  ('Maintenance tools');

INSERT INTO Roles (name) VALUES ('Admin');

-- password: webarebears
INSERT INTO Users (firstname, lastname, email, password_hash) VALUES
    ('Pavel', 'Mayorov', 'pamayo@taltech.ee', '$argon2i$v=19$m=19456,t=2,p=1$QkJiWVVIdXg4MTAxY2dNOQ$JMZNNF+T0JQ15hdXWngW/gusXqOBtPUdsocG3k+yEfA');

INSERT INTO UserRoles (user_id, role_id) VALUES (
                                                 (SELECT id FROM Users WHERE email = 'pamayo@taltech.ee'),
                                                 (SELECT id FROM Roles WHERE name = 'Admin')
                                                );

WITH user AS (
    SELECT id FROM Users WHERE email = 'pamayo@taltech.ee'
),
inUse AS (
    SELECT id FROM Statuses WHERE name = 'In use'
),
inStorage AS (
    SELECT id FROM Statuses WHERE name = 'In storage'
),
underMaintenance AS (
    SELECT id FROM Statuses WHERE name = 'Under maintenance'
),
operational AS (
    SELECT id FROM Conditions WHERE name = 'Operational'
),
maintenance AS (
    SELECT id FROM Conditions WHERE name = 'Requires maintenance'
),
damaged AS (
    SELECT id FROM Conditions WHERE name = 'Damaged'
),
owned AS (
    SELECT id FROM Ownerships WHERE name = 'Owned'
),
leased AS (
    SELECT id FROM Ownerships WHERE name = 'Leased'
)
INSERT INTO Assets (name, description, status_id, ownership_id, condition_id, acquired_at, acquisition_price, expected_lifespan, created_by_id, updated_by_id) VALUES
    ('Industrial Oven', 'Large capacity oven for baking bread', (SELECT id FROM inUse), (SELECT id FROM owned), (SELECT id FROM operational), CURRENT_TIMESTAMP, 1000, 8, (SELECT id FROM user), (SELECT id FROM user)),
    ('Dough Mixer', 'Heavy-duty mixer for dough preparation', (SELECT id FROM inStorage), (SELECT id FROM owned), (SELECT id FROM maintenance), CURRENT_TIMESTAMP, 250, 24, (SELECT id FROM user), (SELECT id FROM user)),
    ('Delivery Van', 'Refrigerated van for transporting goods', (SELECT id FROM underMaintenance), (SELECT id FROM leased), (SELECT id FROM damaged), CURRENT_TIMESTAMP, 20500, 60, (SELECT id FROM user), (SELECT id FROM user));

WITH equipment AS (
    SELECT id FROM Categories WHERE name = 'Production equipment'
)
INSERT INTO AssetCategories (asset_id, category_id) VALUES
                                  (1, (SELECT id FROM equipment)),
                                  (2, (SELECT id FROM equipment)),
                                  (3, (SELECT id FROM Categories WHERE name = 'Delivery & Logistics'));
