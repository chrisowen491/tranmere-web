import { Appearance } from "@tranmere-web/lib/src/tranmere-web-types";
import Link from "next/link";

export function SquadAppearance(props: {
  players: Appearance[];
  colSpan: number;
}) {
  return (
    <>
      {props.players.map((p, idx) => (
        <td colSpan={props.colSpan} key={idx}>
          <Link href={`/page/player/${p.Name}`}>
            <img src={p.bio!.picLink} alt="Avatar" />
          </Link>
          {p.RedCard ? (
            <Link href={`/page/player/${p.Name}`} className="red">
              {p.Name}
            </Link>
          ) : (
            <>
              {p.YellowCard ? (
                <Link href={`/page/player/${p.Name}`} className="yellow">
                  {p.Name}
                </Link>
              ) : (
                <Link href={`/page/player/${p.Name}`}>{p.Name}</Link>
              )}
            </>
          )}
          {p.SubbedBy ? (
            <>
              {p.SubRed ? (
                <Link href={`/page/player/${p.SubbedBy}`} className="red">
                  ({p.SubbedBy} {p.SubTime})
                </Link>
              ) : (
                <>
                  {p.SubYellow ? (
                    <Link href={`/page/player/${p.SubbedBy}`} className="yellow">
                      ({p.SubbedBy} {p.SubTime})
                    </Link>
                  ) : (
                    <Link href={`/page/player/${p.SubbedBy}`}>
                      ({p.SubbedBy} {p.SubTime})
                    </Link>
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
