UPDATE Players
SET name = 'Christian Edwards',
    updated_at = CURRENT_TIMESTAMP
WHERE name = 'Chris Edwards';

UPDATE Apps
SET player_name = 'Christian Edwards'
WHERE player_name = 'Chris Edwards';

UPDATE Apps
SET substituted_by = 'Christian Edwards'
WHERE substituted_by = 'Chris Edwards';

UPDATE Apps
SET substitute_substituted_by = 'Christian Edwards'
WHERE substitute_substituted_by = 'Chris Edwards';

UPDATE PlayerSeasonSummaries
SET player_name = 'Christian Edwards'
WHERE player_name = 'Chris Edwards';
