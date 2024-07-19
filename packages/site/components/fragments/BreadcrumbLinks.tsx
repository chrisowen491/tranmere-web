export interface Breadcrumb {
  id: number;
  name: string;
  href: string;
}

export function BreadcrumbLinks(props: {
  breadcrumbs: Breadcrumb[];
  currentpage: string;
  currenthref: string;
}) {
  return (
    <nav
      aria-label="Breadcrumb"
      className="mx-auto max-w-7xl"
    >
      <ol role="list" className="flex items-center space-x-4">
        {props.breadcrumbs.map((breadcrumb) => (
          <li key={breadcrumb.id}>
            <div className="flex items-center">
              <a
                href={breadcrumb.href}
                className="mr-4 text-sm font-medium text-gray-900 dark:text-gray-50"
              >
                {breadcrumb.name}
              </a>
              <svg
                viewBox="0 0 6 20"
                aria-hidden="true"
                className="h-5 w-auto text-gray-300"
              >
                <path
                  d="M4.878 4.34H3.551L.27 16.532h1.327l3.281-12.19z"
                  fill="currentColor"
                />
              </svg>
            </div>
          </li>
        ))}
        <li className="text-sm">
          <a
            href={props.currenthref}
            aria-current="page"
            className="font-medium text-gray-500 hover:text-gray-600 dark:text-blue-600"
          >
            {props.currentpage}
          </a>
        </li>
      </ol>
    </nav>
  );
}
