import { GetLastMatch } from "@/lib/apiFunctions";
import Link from "next/link";

export async function LastMatch() {
  const match = await GetLastMatch();
  const score = `${match.home} ${match.ft} ${match.visitor}`
  return (
    <div className="card bordered text-center" itemScope itemType ="https://schema.org/SportsEvent">
        <div className="card-body pr-8">
            <h3 className="fs-28 text-dark"><b>Last Match</b> </h3>
            {
                match.largeprogramme
                ? <meta itemProp="image" content={`https://images.tranmere-web.com/${match.largeprogramme}`} />
                : ''
            }
            
            <meta itemProp="startDate" content={match.date} />
            <meta itemProp="awayTeam" content={match.visitor} />
            <meta itemProp="homeTeam" content={match.home} />
            <meta itemProp="name" content={score} />
            <meta itemProp="location" content={match.home} />
            <h5>{match.opposition} ({match.ft})</h5>
            {
                match.largeprogramme
                ? <p className="mt-2"> <img src={`https://images.tranmere-web.com/${match.largeprogramme}`} /></p>
                : ''
            }
            <Link itemProp="url" className="btn btn-primary" href={`/match/${match.season}/${match.date}`}>Match Report</Link>
            <i className="icon-trophy icon-background"></i>
        </div> 
    </div>
  );
}