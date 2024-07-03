export function Kit(props: { season: string; image: string }) {
  return (
    <div className="card stacked" style={{ marginBottom: "50px" }}>
      <div className="card-body" style={{ backgroundColor: "aliceblue" }}>
        <div className="row gutter-2 align-items-center">
          <div className="col">
            <h3 className="card-title mb-1">{props.season}</h3>
          </div>
          <div className="col">
            <img src={props.image} width="100px" />
          </div>
        </div>
      </div>
    </div>
  );
}
