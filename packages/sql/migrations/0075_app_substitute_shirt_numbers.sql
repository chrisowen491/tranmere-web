ALTER TABLE Apps ADD COLUMN substituted_by_shirt_number INTEGER;
ALTER TABLE Apps ADD COLUMN substitute_substituted_by_shirt_number INTEGER;

UPDATE Apps
SET substituted_by_shirt_number = 12
WHERE season < 1986
  AND substituted_by IS NOT NULL
  AND TRIM(substituted_by) <> '';

UPDATE Apps
SET substitute_substituted_by_shirt_number = 12
WHERE season < 1986
  AND substitute_substituted_by IS NOT NULL
  AND TRIM(substitute_substituted_by) <> '';

CREATE TRIGGER Apps_pre_1986_substitute_numbers_insert
AFTER INSERT ON Apps
WHEN NEW.season < 1986
BEGIN
  UPDATE Apps
  SET substituted_by_shirt_number = CASE
        WHEN NEW.substituted_by IS NOT NULL AND TRIM(NEW.substituted_by) <> ''
          THEN 12
        ELSE substituted_by_shirt_number
      END,
      substitute_substituted_by_shirt_number = CASE
        WHEN NEW.substitute_substituted_by IS NOT NULL
          AND TRIM(NEW.substitute_substituted_by) <> ''
          THEN 12
        ELSE substitute_substituted_by_shirt_number
      END
  WHERE id = NEW.id;
END;

CREATE TRIGGER Apps_pre_1986_substitute_numbers_update
AFTER UPDATE OF season, substituted_by, substitute_substituted_by ON Apps
WHEN NEW.season < 1986
BEGIN
  UPDATE Apps
  SET substituted_by_shirt_number = CASE
        WHEN NEW.substituted_by IS NOT NULL AND TRIM(NEW.substituted_by) <> ''
          THEN 12
        ELSE NULL
      END,
      substitute_substituted_by_shirt_number = CASE
        WHEN NEW.substitute_substituted_by IS NOT NULL
          AND TRIM(NEW.substitute_substituted_by) <> ''
          THEN 12
        ELSE NULL
      END
  WHERE id = NEW.id;
END;
