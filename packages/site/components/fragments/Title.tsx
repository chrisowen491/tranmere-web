export async function Title(props: { title: string, subTitle?: string, summary?: string, children?: React.ReactNode }) {
  return (
    <div className="py-10">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="lg:mx-0">
          {props.subTitle ? ( <p className="text-base font-semibold leading-7 text-indigo-600 dark:text-sky-400">{props.subTitle}</p>) : ( "" )}
          <h2 className="mt-2 text-4xl font-bold tracking-tight sm:text-6xl">{props.title}</h2>
          {props.summary ? ( 
            <p className="mt-6 text-lg leading-8 text-gray-600 dark:text-gray-50" dangerouslySetInnerHTML={{ __html: props.summary }}></p>
          ) : ( "" )}
          {props.children}
        </div>
      </div>
    </div>
   
  );
}
