PRAGMA foreign_keys = ON;

--- clear existing schema ---
DROP TABLE IF EXISTS assets_asset_categories_join;

DROP TABLE IF EXISTS assets;

DROP TABLE IF EXISTS asset_categories;

DROP TABLE IF EXISTS asset_conditions;

DROP TABLE IF EXISTS asset_ownerships;

DROP TABLE IF EXISTS sessions;

DROP TABLE IF EXISTS asset_statuses;

DROP TABLE IF EXISTS users_user_roles_join;

DROP TABLE IF EXISTS user_roles;

DROP TABLE IF EXISTS users;

--- classificators ---
CREATE TABLE asset_statuses
(
    status_code TEXT NOT NULL,
    name        TEXT NOT NULL,
    CONSTRAINT pk_asset_statuses PRIMARY KEY (status_code),
    CONSTRAINT uq_asset_statuses_name UNIQUE (name),
    CONSTRAINT chk_asset_statuses_status_code CHECK ( LENGTH(TRIM(status_code)) > 0 AND
                                                      LENGTH(TRIM(status_code)) <= 5 AND status_code GLOB '[A-Z]*' ),
    CONSTRAINT chk_asset_statuses_name CHECK ( LENGTH(TRIM(name)) > 10 AND LENGTH(TRIM(name)) <= 50 )
);

CREATE TABLE asset_ownerships
(
    ownership_code TEXT NOT NULL,
    name           TEXT NOT NULL,
    CONSTRAINT pk_asset_ownerships PRIMARY KEY (ownership_code),
    CONSTRAINT uq_asset_ownerships_name UNIQUE (name),
    CONSTRAINT chk_asset_ownerships_ownership_code CHECK ( LENGTH(TRIM(ownership_code)) > 0 AND
                                                           LENGTH(TRIM(ownership_code)) <= 5 AND
                                                           ownership_code GLOB '[A-Z]*' ),
    CONSTRAINT chk_asset_ownerships_name CHECK ( LENGTH(TRIM(name)) > 10 AND LENGTH(TRIM(name)) <= 50 )
);

CREATE TABLE asset_conditions
(
    condition_code TEXT NOT NULL,
    name           TEXT NOT NULL,
    CONSTRAINT pk_asset_conditions PRIMARY KEY (condition_code),
    CONSTRAINT uq_asset_conditions_name UNIQUE (name),
    CONSTRAINT chk_asset_conditions_condition_code CHECK ( LENGTH(TRIM(condition_code)) > 0 AND
                                                           LENGTH(TRIM(condition_code)) <= 5 AND
                                                           condition_code GLOB '[A-Z]*' ),
    CONSTRAINT chk_asset_conditions_name CHECK ( LENGTH(TRIM(name)) > 10 AND LENGTH(TRIM(name)) <= 50 )
);

CREATE TABLE asset_categories
(
    category_code TEXT NOT NULL,
    name          TEXT NOT NULL,
    CONSTRAINT pk_asset_categories PRIMARY KEY (category_code),
    CONSTRAINT uq_asset_categories_name UNIQUE (name),
    CONSTRAINT chk_asset_categories_category_code CHECK ( LENGTH(TRIM(category_code)) > 0 AND
                                                          LENGTH(TRIM(category_code)) <= 5 AND
                                                          category_code GLOB '[A-Z]*' ),
    CONSTRAINT chk_asset_categories_name CHECK ( LENGTH(TRIM(name)) > 10 AND LENGTH(TRIM(name)) <= 50 )
);

CREATE TABLE user_roles
(
    role_code TEXT NOT NULL,
    name      TEXT NOT NULL,
    CONSTRAINT pk_user_roles PRIMARY KEY (role_code),
    CONSTRAINT uq_user_roles_name UNIQUE (name),
    CONSTRAINT chk_user_roles_role_code CHECK ( LENGTH(TRIM(role_code)) > 0 AND LENGTH(TRIM(role_code)) <= 5 AND
                                                role_code GLOB '[A-Z]*' ),
    CONSTRAINT chk_user_roles_name CHECK ( LENGTH(TRIM(name)) > 10 AND LENGTH(TRIM(name)) <= 50 )
);

--- users ---
CREATE TABLE users
(
    user_id       INTEGER NOT NULL,
    firstname     TEXT,
    lastname      TEXT,
    email         TEXT    NOT NULL,
    password_hash TEXT    NOT NULL,
    CONSTRAINT pk_users PRIMARY KEY (user_id),
    CONSTRAINT uq_users_email UNIQUE (email COLLATE NOCASE),
    CONSTRAINT chk_users_user_id CHECK ( user_id >= 0 ),
    CONSTRAINT chk_users_firstname_lastname CHECK ( firstname IS NOT NULL OR lastname IS NOT NULL ),
    CONSTRAINT chk_users_firstname CHECK ( LENGTH(TRIM(firstname)) > 0 AND LENGTH(TRIM(firstname)) <= 50 ),
    CONSTRAINT chk_users_lastname CHECK ( LENGTH(TRIM(lastname)) > 0 AND LENGTH(TRIM(lastname)) <= 50 ),
    CONSTRAINT chk_users_email CHECK ( email LIKE '%_@__%.__%' AND LENGTH(TRIM(email)) <= 254 ),
    CONSTRAINT chk_users_password_hash CHECK ( LENGTH(TRIM(password_hash)) > 0 AND LENGTH(TRIM(password_hash)) <= 512 )
);

CREATE TABLE users_user_roles_join
(
    user_id   INTEGER NOT NULL,
    role_code TEXT    NOT NULL,
    CONSTRAINT pk_users_user_roles_join PRIMARY KEY (user_id, role_code),
    CONSTRAINT fk_users_user_roles_join_users FOREIGN KEY (user_id) REFERENCES users (user_id),
    CONSTRAINT fk_users_user_roles_join_roles FOREIGN KEY (role_code) REFERENCES user_roles (role_code) ON UPDATE CASCADE
);

--- sessions ---
CREATE TABLE sessions
(
    session_code TEXT    NOT NULL,
    user_id      INTEGER NOT NULL,
    expires_at   INTEGER NOT NULL,
    CONSTRAINT pk_sessions PRIMARY KEY (session_code),
    CONSTRAINT chk_sessions_session_code CHECK ( LENGTH(TRIM(session_code)) > 0 AND
                                                 LENGTH(TRIM(session_code)) <= 254 AND session_code GLOB '[a-z0-9]*' ),
    CONSTRAINT chk_sessions_expires_at CHECK ( expires_at BETWEEN strftime('%s', '1970-01-01') AND strftime('%s', '2100-12-31') ),
    CONSTRAINT fk_sessions_users FOREIGN KEY (user_id) REFERENCES users (user_id)
);

--- assets ---
CREATE TABLE assets
(
    asset_code        TEXT    NOT NULL,
    name              TEXT    NOT NULL,
    description       TEXT,
    status_code       TEXT    NOT NULL,
    ownership_code    TEXT    NOT NULL,
    condition_code    TEXT    NOT NULL,
    acquired_at       INTEGER NOT NULL,
    acquisition_price INTEGER NOT NULL,
    expected_lifespan INTEGER NOT NULL,
    image_url         TEXT,
    created_by_id     INTEGER NOT NULL,
    updated_by_id     INTEGER NOT NULL,
    deleted_by_id     INTEGER,
    created_at        INTEGER NOT NULL DEFAULT (strftime('%s', 'now')),
    updated_at        INTEGER NOT NULL DEFAULT (strftime('%s', 'now')),
    deleted_at        INTEGER,
    CONSTRAINT pk_assets PRIMARY KEY (asset_code),
    CONSTRAINT chk_assets_asset_code CHECK ( LENGTH(TRIM(asset_code)) > 0 AND LENGTH(TRIM(asset_code)) <= 254 AND
                                             asset_code GLOB '[a-z0-9]*'),
    CONSTRAINT chk_assets_name CHECK ( LENGTH(TRIM(name)) > 10 AND LENGTH(TRIM(name)) <= 254 ),
    CONSTRAINT chk_assets_description CHECK ( LENGTH(TRIM(description)) > 3 AND LENGTH(TRIM(description)) <= 512 ),
    CONSTRAINT chk_assets_acquired_at CHECK ( acquired_at BETWEEN strftime('%s', '1970-01-01') AND strftime('%s', '2100-12-31') ),
    CONSTRAINT chk_assets_acquisition_price CHECK ( acquisition_price >= 0 ),
    CONSTRAINT chk_assets_expected_lifespan CHECK ( expected_lifespan >= 0 ),
    CONSTRAINT chk_assets_image_url CHECK ( LENGTH(TRIM(image_url)) <= 512 AND
                                            (image_url LIKE 'http://%' OR image_url LIKE 'https://%') ),
    CONSTRAINT chk_assets_created_at CHECK ( created_at BETWEEN strftime('%s', '1970-01-01') AND strftime('%s', '2100-12-31') ),
    CONSTRAINT chk_assets_updated_at CHECK ( updated_at BETWEEN strftime('%s', '1970-01-01') AND strftime('%s', '2100-12-31') ),
    CONSTRAINT chk_assets_deleted_at_deleted_by_id CHECK ( (deleted_at IS NULL AND deleted_by_id IS NULL) OR
                                                           (deleted_at IS NOT NULL AND deleted_by_id IS NOT NULL) ),
    CONSTRAINT chk_assets_deleted_at CHECK ( deleted_at BETWEEN strftime('%s', '1970-01-01') AND strftime('%s', '2100-12-31') ),
    CONSTRAINT fk_assets_asset_statuses FOREIGN KEY (status_code) REFERENCES asset_statuses (status_code) ON UPDATE CASCADE,
    CONSTRAINT fk_assets_asset_ownerships FOREIGN KEY (ownership_code) REFERENCES asset_ownerships (ownership_code) ON UPDATE CASCADE,
    CONSTRAINT fk_assets_asset_conditions FOREIGN KEY (condition_code) REFERENCES asset_conditions (condition_code) ON UPDATE CASCADE,
    CONSTRAINT fk_assets_users_created_by FOREIGN KEY (created_by_id) REFERENCES users (user_id),
    CONSTRAINT fk_assets_users_updated_by FOREIGN KEY (updated_by_id) REFERENCES users (user_id),
    CONSTRAINT fk_assets_users_deleted_by FOREIGN KEY (deleted_by_id) REFERENCES users (user_id)
);

CREATE TABLE assets_asset_categories_join
(
    asset_code    TEXT NOT NULL,
    category_code TEXT NOT NULL,
    CONSTRAINT pk_assets_asset_categories_join PRIMARY KEY (asset_code, category_code),
    CONSTRAINT fk_assets_asset_categories_join_assets FOREIGN KEY (asset_code) REFERENCES assets (asset_code) ON UPDATE CASCADE,
    CONSTRAINT fk_assets_asset_categories_join_asset_categories FOREIGN KEY (category_code) REFERENCES asset_categories (category_code) ON UPDATE CASCADE
);

CREATE TRIGGER trg_assets_status_code_before_update
    BEFORE UPDATE OF status_code
    ON assets
    FOR EACH ROW
    WHEN new.status_code IN ('USE', 'SRVC')
BEGIN
    SELECT CASE
               WHEN old.status_code = 'STORE' THEN NULL
               ELSE RAISE(ABORT, 'Status transition is not allowed. First move asset to storage.')
               END;
END;

CREATE TRIGGER trg_assets_status_code_before_delete
    BEFORE UPDATE
    ON assets
    FOR EACH ROW
    WHEN new.deleted_by_id IS NOT NULL AND new.deleted_at IS NOT NULL
BEGIN
    SELECT CASE
               WHEN old.status_code = 'STORE' THEN NULL
               ELSE RAISE(ABORT, 'Status cannot be removed. First move asset to storage.')
               END;
END;

CREATE TRIGGER trg_assets_status_code_before_create
    BEFORE INSERT
    ON assets
    FOR EACH ROW
BEGIN
    SELECT CASE
               WHEN new.status_code = 'STORE' THEN NULL
               ELSE RAISE(ABORT, 'Status cannot be created. Asset should be moved to storage on creation.')
               END;
END;

--- seed data ---
INSERT INTO asset_statuses (status_code, name)
VALUES ('USE', 'Asset in use'),
       ('STORE', 'Asset in storage'),
       ('SRVC', 'Asset under maintenance');

INSERT INTO asset_ownerships (ownership_code, name)
VALUES ('OWNED', 'Asset Owned'),
       ('LEASE', 'Asset Leased'),
       ('SRENT', 'Asset Short-term rent'),
       ('LRENT', 'Asset Long-term rent'),
       ('DNT', 'Asset Donated');

INSERT INTO asset_conditions (condition_code, name)
VALUES ('OPER', 'Asset Operational'),
       ('MAIN', 'Asset Requires maintenance'),
       ('DAMG', 'Asset Damaged');

INSERT INTO asset_categories (category_code, name)
VALUES ('PEQ', 'Production equipment'),
       ('SEQ', 'Storage equipment'),
       ('LOG', 'Delivery & Logistics'),
       ('TOOL', 'Maintenance tools');

INSERT INTO user_roles (role_code, name)
VALUES ('ADMIN', 'System administrator');

-- password: webarebears
INSERT INTO users (firstname, lastname, email, password_hash)
VALUES ('Pavel', 'Mayorov', 'pamayo@taltech.ee',
        '$argon2i$v=19$m=19456,t=2,p=1$QkJiWVVIdXg4MTAxY2dNOQ$JMZNNF+T0JQ15hdXWngW/gusXqOBtPUdsocG3k+yEfA');

INSERT INTO users_user_roles_join (user_id, role_code)
VALUES ((SELECT user_id FROM users WHERE email = 'pamayo@taltech.ee'),
        (SELECT role_code FROM user_roles WHERE role_code = 'ADMIN'));

WITH user AS (SELECT user_id AS id
              FROM users
              WHERE email = 'pamayo@taltech.ee'),
     inUse AS (SELECT status_code AS id
               FROM asset_statuses
               WHERE name = 'Asset in use'),
     inStorage AS (SELECT status_code AS id FROM asset_statuses WHERE name = 'Asset in storage'),
     underMaintenance AS (SELECT status_code AS id FROM asset_statuses WHERE name = 'Asset under maintenance'),
     operational AS (SELECT condition_code AS id FROM asset_conditions WHERE name = 'Asset Operational'),
     maintenance AS (SELECT condition_code AS id FROM asset_conditions WHERE name = 'Asset Requires maintenance'),
     damaged AS (SELECT condition_code AS id FROM asset_conditions WHERE name = 'Asset Damaged'),
     owned AS (SELECT ownership_code AS id FROM asset_ownerships WHERE name = 'Asset Owned'),
     leased AS (SELECT ownership_code AS id FROM asset_ownerships WHERE name = 'Asset Leased')
INSERT
INTO Assets (asset_code, name, description, status_code, ownership_code, condition_code, acquired_at,
             acquisition_price,
             expected_lifespan, created_by_id, updated_by_id)
VALUES ('s6gysid1xwjhcful23bus04d', 'Industrial Oven', 'Large capacity oven for baking bread',
        (SELECT id FROM inStorage),
        (SELECT id FROM owned), (SELECT id FROM operational), strftime('%s', 'now'), 1000, 8, (SELECT id FROM user),
        (SELECT id FROM user)),
       ('owp63iikb5xabpbh7p3hls91', 'Dough Mixer', 'Heavy-duty mixer for dough preparation',
        (SELECT id FROM inStorage),
        (SELECT id FROM owned), (SELECT id FROM maintenance), strftime('%s', 'now'), 250, 24, (SELECT id FROM user),
        (SELECT id FROM user)),
       ('cmecowy42vhqi5ipcmms9lr0', 'Delivery Van', 'Refrigerated van for transporting goods',
        (SELECT id FROM inStorage), (SELECT id FROM leased), (SELECT id FROM damaged), strftime('%s', 'now'),
        20500, 60, (SELECT id FROM user), (SELECT id FROM user));

WITH inUse AS (SELECT status_code AS id
               FROM asset_statuses
               WHERE name = 'Asset in use')
UPDATE assets
SET status_code = (SELECT id FROM inUse)
WHERE asset_code = 's6gysid1xwjhcful23bus04d';

WITH underMaintenance AS (SELECT status_code AS id FROM asset_statuses WHERE name = 'Asset under maintenance')
UPDATE assets
SET status_code = (SELECT id FROM underMaintenance)
WHERE asset_code = 'cmecowy42vhqi5ipcmms9lr0';

WITH equipment AS (SELECT category_code AS id FROM asset_categories WHERE name = 'Production equipment')
INSERT
INTO assets_asset_categories_join (asset_code, category_code)
VALUES ('s6gysid1xwjhcful23bus04d', (SELECT id FROM equipment)),
       ('owp63iikb5xabpbh7p3hls91', (SELECT id FROM equipment)),
       ('cmecowy42vhqi5ipcmms9lr0',
        (SELECT category_code FROM asset_categories WHERE name = 'Delivery & Logistics'));
