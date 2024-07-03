import { Player } from "@tranmere-web/lib/src/tranmere-web-types";

export function OnThisDay(props: { randomplayer: Player }) {
  const { randomplayer = props.randomplayer } = props;

  return (
    <></>
    
    /*
    <div id="onthisday">
<div className="card bordered text-center">
    <div className="card-body pr-8">
        <h3 className="fs-28 text-dark"><b>On This Day</b> </h3>
        <h5>{{opposition}} ({{season}})</h5>
        <p className="mt-2"> <img src="https://images.tranmere-web.com/{{largeprogramme}}"/></p>
        <a href="/match/{{season}}/{{date}}" className="btn btn-primary">Match Report</a> 
        <i className="icon-backward icon-background"></i>
    </div>
</div>
</div>
*/
  );
}
