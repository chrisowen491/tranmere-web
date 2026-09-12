CREATE TABLE IF NOT EXISTS ManagerLinks (
  id TEXT NOT NULL PRIMARY KEY,
  manager_id TEXT NOT NULL,
  label TEXT NOT NULL,
  url TEXT NOT NULL,
  publisher TEXT,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  FOREIGN KEY (manager_id) REFERENCES Managers(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS ManagerLinks_manager_sort_idx
  ON ManagerLinks (manager_id, sort_order, label);
