CREATE INDEX IF NOT EXISTS Ratings_page_url_created_idx
  ON Ratings (page_url, created DESC, id DESC);
