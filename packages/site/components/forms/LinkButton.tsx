export function LinkButton(props: { text: string; href: string }) {
  return (
    <a
      href={props.href}
      className="font-medium leading-6 text-indigo-600 hover:text-indigo-500 dark:text-blue-400"
      itemProp="url"
    >
      {props.text}
    </a>
  );
}
