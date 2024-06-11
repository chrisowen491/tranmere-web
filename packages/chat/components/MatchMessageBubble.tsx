import { ExtendedMessage } from "./Types";

export function MatchMessageBubble(props: { message: ExtendedMessage}) {
  return (
    <div className="card bordered text-center">
      <div className="card-body pr-8">
          <h3 className="fs-28 text-light"> {props.message.match?.homeTeam} {props.message.match?.score} {props.message.match?.awayTeam}</h3>
          <a href={`https://www.tranmere-web.com/match/${props.message.match?.season}/${props.message.match?.date}`} className="btn btn-success">Match Report</a> 
          <i className="icon-backward icon-background"></i>
      </div>
    </div>
  );
}