CREATE TABLE IF NOT EXISTS Ratings (
  id INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
  page_url TEXT NOT NULL,
  image_url TEXT NOT NULL,
  created TEXT NOT NULL,
  sub TEXT NOT NULL,
  user_name TEXT NOT NULL,
  email TEXT NOT NULL,
  rating INTEGER NOT NULL,
  comment TEXT
);

CREATE INDEX IF NOT EXISTS Ratings_page_url_created_idx
  ON Ratings (page_url, created DESC, id DESC);
