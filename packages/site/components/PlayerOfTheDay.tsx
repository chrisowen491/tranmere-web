import { Player } from "@tranmere-web/lib/src/tranmere-web-types";

export function PlayerOfTheDay(props: { randomplayer: Player }) {
  const { randomplayer = props.randomplayer } = props;

  return (
    <></>
    /*
<div className="row justify-content-center justify-content-lg-start gutter-2 player-of-day">
    <div className="col-lg-12 col-md-12 col-sm-12">
        <div className="card stacked" itemScope itemType ="https://schema.org/SportsTeam">
            <meta itemProp="name" content="Tranmere Rovers" />
            <div className="card-body" style={{backgroundImage:`url(${randomplayer.picLink})`>
                <div className="row gutter-2 align-items-center">
                    <div className="col" itemprop="member" itemscope itemtype="https://schema.org/athlete">
                        <meta itemProp="image" content="{{randomplayer.picLink}}" />
                        <h3 className="font-weight-normal mb-2">Player Of The Day</h3>
                        <h4 className="font-weight-normal mb-3" itemProp="name">{{randomplayer.name}}</h4>
                        <p><strong>Debut:</strong> {{randomplayer.debut.Opposition}} {{randomplayer.debut.Date}}</p>
                        <p className="card-text mb-2">{{randomplayer.apps}} apps</p>
                        <p className="card-text mb-2">{{randomplayer.goals}} goals</p>
                        <a href="/page/player/{{randomplayer.name}}" className="action mt-1 text-blue">View Profile</a>
                    </div>
                </div>
            </div>
        </div>                                     
    </div>          
</div>
*/
  );
}
