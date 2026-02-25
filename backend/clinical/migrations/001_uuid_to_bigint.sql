-- Clinical service migration: UUID -> BIGINT IDs
-- Target DB: MySQL 8+
-- Run this script against clinical_db after taking a full DB backup.
-- Important: you must fill _user_uuid_to_long_map before continuing.

START TRANSACTION;

-- 1) Safety backups
CREATE TABLE IF NOT EXISTS medical_histories_backup_20260214 AS
SELECT * FROM medical_histories;

CREATE TABLE IF NOT EXISTS consultations_backup_20260214 AS
SELECT * FROM consultations;

-- 2) Internal UUID -> BIGINT maps for primary keys
DROP TABLE IF EXISTS _mh_id_map;
CREATE TABLE _mh_id_map (
    new_id BIGINT NOT NULL AUTO_INCREMENT,
    old_id CHAR(36) NOT NULL,
    PRIMARY KEY (new_id),
    UNIQUE KEY uk_mh_old_id (old_id)
) ENGINE=InnoDB;

INSERT INTO _mh_id_map (old_id)
SELECT id FROM medical_histories ORDER BY id;

DROP TABLE IF EXISTS _cons_id_map;
CREATE TABLE _cons_id_map (
    new_id BIGINT NOT NULL AUTO_INCREMENT,
    old_id CHAR(36) NOT NULL,
    PRIMARY KEY (new_id),
    UNIQUE KEY uk_cons_old_id (old_id)
) ENGINE=InnoDB;

INSERT INTO _cons_id_map (old_id)
SELECT id FROM consultations ORDER BY id;

-- 3) REQUIRED: map user UUIDs to current user-service Long IDs
-- Fill this table before running updates below.
CREATE TABLE IF NOT EXISTS _user_uuid_to_long_map (
    old_user_id CHAR(36) NOT NULL,
    new_user_id BIGINT NOT NULL,
    PRIMARY KEY (old_user_id),
    UNIQUE KEY uk_user_new_id (new_user_id)
) ENGINE=InnoDB;

-- 4) Add temporary BIGINT columns
ALTER TABLE medical_histories
    ADD COLUMN id_new BIGINT NULL,
    ADD COLUMN user_id_new BIGINT NULL;

ALTER TABLE consultations
    ADD COLUMN id_new BIGINT NULL,
    ADD COLUMN patient_id_new BIGINT NULL,
    ADD COLUMN doctor_id_new BIGINT NULL,
    ADD COLUMN medical_history_id_new BIGINT NULL;

-- 5) Populate internal IDs
UPDATE medical_histories mh
JOIN _mh_id_map m ON mh.id = m.old_id
SET mh.id_new = m.new_id;

UPDATE consultations c
JOIN _cons_id_map m ON c.id = m.old_id
SET c.id_new = m.new_id;

-- 6) Populate user-linked IDs (requires _user_uuid_to_long_map to be complete)
UPDATE medical_histories mh
JOIN _user_uuid_to_long_map um ON mh.user_id = um.old_user_id
SET mh.user_id_new = um.new_user_id;

UPDATE consultations c
JOIN _user_uuid_to_long_map ump ON c.patient_id = ump.old_user_id
JOIN _user_uuid_to_long_map umd ON c.doctor_id = umd.old_user_id
SET c.patient_id_new = ump.new_user_id,
    c.doctor_id_new = umd.new_user_id;

-- 7) Populate FK to medical_histories
UPDATE consultations c
JOIN _mh_id_map m ON c.medical_history_id = m.old_id
SET c.medical_history_id_new = m.new_id;

-- 8) Validate migration completeness (all counts should be 0)
SELECT COUNT(*) AS missing_mh_id_new FROM medical_histories WHERE id_new IS NULL;
SELECT COUNT(*) AS missing_mh_user_new FROM medical_histories WHERE user_id_new IS NULL;
SELECT COUNT(*) AS missing_cons_id_new FROM consultations WHERE id_new IS NULL;
SELECT COUNT(*) AS missing_cons_patient_new FROM consultations WHERE patient_id_new IS NULL;
SELECT COUNT(*) AS missing_cons_doctor_new FROM consultations WHERE doctor_id_new IS NULL;

-- 9) Drop existing FK on consultations.medical_history_id (name may vary)
SET @fk_name = (
    SELECT kcu.CONSTRAINT_NAME
    FROM information_schema.KEY_COLUMN_USAGE kcu
    WHERE kcu.TABLE_SCHEMA = DATABASE()
      AND kcu.TABLE_NAME = 'consultations'
      AND kcu.COLUMN_NAME = 'medical_history_id'
      AND kcu.REFERENCED_TABLE_NAME = 'medical_histories'
    LIMIT 1
);

SET @drop_fk_sql = IF(
    @fk_name IS NULL,
    'SELECT 1',
    CONCAT('ALTER TABLE consultations DROP FOREIGN KEY `', @fk_name, '`')
);
PREPARE stmt FROM @drop_fk_sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- 10) Replace old UUID columns with new BIGINT columns
ALTER TABLE medical_histories
    DROP PRIMARY KEY,
    DROP COLUMN id,
    DROP COLUMN user_id,
    CHANGE COLUMN id_new id BIGINT NOT NULL,
    CHANGE COLUMN user_id_new user_id BIGINT NOT NULL,
    ADD PRIMARY KEY (id),
    MODIFY COLUMN id BIGINT NOT NULL AUTO_INCREMENT,
    ADD UNIQUE KEY uk_medical_histories_user_id (user_id);

ALTER TABLE consultations
    DROP PRIMARY KEY,
    DROP COLUMN id,
    DROP COLUMN patient_id,
    DROP COLUMN doctor_id,
    DROP COLUMN medical_history_id,
    CHANGE COLUMN id_new id BIGINT NOT NULL,
    CHANGE COLUMN patient_id_new patient_id BIGINT NOT NULL,
    CHANGE COLUMN doctor_id_new doctor_id BIGINT NOT NULL,
    CHANGE COLUMN medical_history_id_new medical_history_id BIGINT NULL,
    ADD PRIMARY KEY (id),
    MODIFY COLUMN id BIGINT NOT NULL AUTO_INCREMENT;

ALTER TABLE consultations
    ADD CONSTRAINT fk_consultations_medical_history
        FOREIGN KEY (medical_history_id) REFERENCES medical_histories(id);

-- 11) Cleanup temporary maps (backup tables are kept)
DROP TABLE IF EXISTS _mh_id_map;
DROP TABLE IF EXISTS _cons_id_map;

COMMIT;
