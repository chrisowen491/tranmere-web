import { Match } from "@tranmere-web/lib/src/tranmere-web-types";

export function ResultTable(props: { results: Match[] }) {
  return (
    <table className="table">
      <thead className="thead-dark">
        <tr>
          <th scope="col">Date</th>
          <th scope="col">Opposition</th>
          <th scope="col">Competition</th>
          <th scope="col">Result</th>
          <th className="d-none d-sm-table-cell" scope="col">
            Att.
          </th>
          <th scope="col" className="d-none d-sm-table-cell">
            Programme
          </th>
        </tr>
      </thead>
      <tbody>
        {props.results.map((result, idx) => (
          <tr key={idx}>
            <td>
              <a href={`/match/${result.season}/${result.date}`}>
                {result.date}
              </a>
            </td>
            <td>
              <a href={`/games/${result.opposition}`}>{result.opposition}</a>
            </td>
            <td>{result.competition}</td>
            <td>{result.ft}</td>
            <td className="d-none d-sm-table-cell">{result.attendance}</td>
            <td className="d-none d-sm-table-cell">
              {result.programme ? (
                <img
                  src={`https://images.tranmere-web.com/${result.programme}`}
                />
              ) : (
                ""
              )}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
