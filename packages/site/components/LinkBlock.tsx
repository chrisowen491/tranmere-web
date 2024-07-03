import { Link } from "@tranmere-web/lib/src/tranmere-web-types";

export function LinkBlock(props: { title: string; links: Link[] }) {
  return (
    <div className="col-md-6">
      <div className="boxed p-3">
        <h4>{props.title}</h4>
        {props.links.map((link, idx) => (
          <a className="nav-link" href={link.link} key={idx}>
            {link.name}
          </a>
        ))}
      </div>
    </div>
  );
}
