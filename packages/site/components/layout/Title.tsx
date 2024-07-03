export async function Title(props: { title: string }) {
  return (
    <div className="row">
      <div className="col-md-8 text-white mb-3">
        <h1 className="h2 pb-1">{props.title}</h1>
        <nav aria-label="breadcrumb">
          <ol
            className="breadcrumb breadcrumb-minimal"
            itemType="http://schema.org/BreadcrumbList"
          >
            <li
              itemProp="itemListElement"
              itemType="http://schema.org/ListItem"
              className="breadcrumb-item"
            >
              <a href="/" itemProp="item">
                <span itemProp="name">
                  Home <meta itemProp="position" content="0" />
                </span>
              </a>
            </li>
            <li
              itemProp="itemListElement"
              itemType="http://schema.org/ListItem"
              className="breadcrumb-item active"
              aria-current="page"
            >
              <span itemProp="name">{props.title}</span>
              <meta itemProp="position" content="1" />
            </li>
          </ol>
        </nav>
      </div>
    </div>
  );
}
