import { ResultsToolData } from "@tranmere-web/tools/src/ResultsTool";

export function ResultsBubble(props: { message: any }) {
  console.log(props.message);
  const matches = JSON.parse(props.message as string) as ResultsToolData;
  return (
    <table className="table-auto text-xs mb-8">
      <thead>
        <tr>
          <th>Season</th>
          <th>Score</th>
        </tr>
      </thead>
      <tbody>
        {matches.results.map((match, idx) => (
          <tr key={idx}>
            <td>{match.season}</td>
            <td>{match.final_score}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
