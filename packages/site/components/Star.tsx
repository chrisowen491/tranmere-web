export function Star(props: {
  name: string;
  notes: string;
  match: string;
  season: string;
  date: string;
  programme: string;
}) {
  return (
    <article className="col-12 tranmere-results">
      <div className="card">
        <div
          className="card-body"
          style={{ backgroundImage: `url(${props.programme})` }}
        >
          <div className="row gutter-2 align-items-center">
            <div className="col">
              <h5 className="card-title mb-1" id="{name}">
                {props.name}
              </h5>
              <p className="card-text mb-2">
                <small>{props.notes}</small>
              </p>
              <p className="card-text mb-2">
                <small>{props.match}</small>
              </p>
              <p className="card-text mb-2">
                <small>
                  <time dateTime={props.date} className="text-muted d-block">
                    {props.date}
                  </time>
                </small>
              </p>
              <div>
                <a
                  href={`/match/${props.season}/${props.date}`}
                  className="btn btn-sm btn-rounded btn-primary"
                >
                  Report
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </article>
  );
}
