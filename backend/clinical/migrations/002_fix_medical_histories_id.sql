-- Fix medical_histories table id column
ALTER TABLE `medical_histories` DROP PRIMARY KEY;
ALTER TABLE `medical_histories` MODIFY `id` BIGINT NOT NULL AUTO_INCREMENT PRIMARY KEY;
