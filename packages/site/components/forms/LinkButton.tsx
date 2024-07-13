export function LinkButton(props: { text: string; href: string }) {
  return (
    <a
      href={props.href}
      className="text-sm font-medium leading-6 text-indigo-600 hover:text-indigo-500 dark:text-blue-600"
    >
      {props.text}
    </a>
  );
}
