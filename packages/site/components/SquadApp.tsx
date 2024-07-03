import { Appearance } from "@tranmere-web/lib/src/tranmere-web-types";

export function SquadAppearance(props: {
  players: Appearance[];
  colSpan: number;
}) {
  return (
    <>
      {props.players.map((p, idx) => (
        <td colSpan={props.colSpan} key={idx}>
          <a href={`/page/player/${p.Name}`}>
            <img src={p.bio!.picLink} alt="Avatar" />
          </a>
          {p.RedCard ? (
            <a href={`/page/player/${p.Name}`} className="red">
              {p.Name}
            </a>
          ) : (
            <>
              {p.YellowCard ? (
                <a href={`/page/player/${p.Name}`} className="yellow">
                  {p.Name}
                </a>
              ) : (
                <a href={`/page/player/${p.Name}`}>{p.Name}</a>
              )}
            </>
          )}
          {p.SubbedBy ? (
            <>
              {p.SubRed ? (
                <a href={`/page/player/${p.SubbedBy}`} className="red">
                  ({p.SubbedBy} {p.SubTime})
                </a>
              ) : (
                <>
                  {p.SubYellow ? (
                    <a href={`/page/player/${p.SubbedBy}`} className="yellow">
                      ({p.SubbedBy} {p.SubTime})
                    </a>
                  ) : (
                    <a href={`/page/player/${p.SubbedBy}`}>
                      ({p.SubbedBy} {p.SubTime})
                    </a>
                  )}
                </>
              )}
            </>
          ) : (
            ""
          )}
        </td>
      ))}
    </>
  );
}
