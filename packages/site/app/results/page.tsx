export default function AgentsPage() {
  return (
    <div>
      <section className="hero bg-blue">
        <div className="container"></div>
      </section>

      <section className="overlay">
        <div className="container overlay-item-top">
          <div className="row">
            <div className="col">
              <div className="content boxed">
                <div className="row separated">
                  <aside className="col-md-3 content-aside bg-light">
                    <div className="widget">
                      <h3 className="widget-title">Filter</h3>
                      <div className="form-group">
                        <label htmlFor="season">Season</label>
                        <select
                          className="form-control form-control-sm"
                          id="season"
                        >
                          <option value="">All</option>
                        </select>
                      </div>
                      <div className="form-group">
                        <label htmlFor="competition">Competition</label>
                        <select
                          className="form-control form-control-sm"
                          id="competition"
                        >
                          <option value="">All</option>
                          <option value="League">League</option>
                        </select>
                      </div>
                      <div className="form-group">
                        <label htmlFor="opposition">Opposition</label>
                        <select
                          className="form-control form-control-sm"
                          id="opposition"
                        >
                          <option value="">All</option>
                        </select>
                      </div>
                      <div className="form-group">
                        <label htmlFor="manager">Manager</label>
                        <select
                          className="form-control form-control-sm"
                          id="manager"
                        >
                          <option value="">All</option>
                        </select>
                      </div>
                      <div className="form-group">
                        <label htmlFor="venue">Venue</label>
                        <select
                          className="form-control form-control-sm"
                          id="venue"
                        >
                          <option value="">All</option>
                          <option>Prenton Park</option>
                          <option>Wembley Stadium</option>
                        </select>
                      </div>
                      <div className="form-group">
                        <label htmlFor="pens">Penalties</label>
                        <select
                          className="form-control form-control-sm"
                          id="pens"
                        >
                          <option value="">No</option>
                          <option>Penalty Shootout</option>
                        </select>
                      </div>
                      <div className="form-group">
                        <label htmlFor="sort">Sort</label>
                        <select
                          className="form-control form-control-sm"
                          id="sort"
                        >
                          <option>Date</option>
                          <option>Top Attendance</option>
                        </select>
                      </div>
                      <button
                        type="button"
                        className="btn btn-sm btn-primary btn-rounded btn-results-search"
                      >
                        Search
                      </button>
                    </div>
                  </aside>
                  <article className="col-md-9 content-body tranmere-results">
                    <div id="loading">
                      <div className="spinner-grow text-primary" role="status">
                        <span className="sr-only">Loading...</span>
                      </div>
                    </div>
                    <div id="results-search"></div>
                  </article>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
