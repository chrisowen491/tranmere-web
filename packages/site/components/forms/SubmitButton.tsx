export function SubmitButton(props: { text?: string, children?: React.ReactNode   }) {
  return (
    <button
    type="submit"
    className="rounded-md 
      bg-green-500 
      dark:bg-sky-400
      px-3 py-2 
      text-sm 
      font-semibold 
      text-white 
      shadow-sm 
      hover:bg-green-600 
      dark:hover:bg-sky-500 
      focus-visible:outline 
      focus-visible:outline-2 
      focus-visible:outline-offset-2 
      focus-visible:outline-indigo-600"
  >
    {props.text}
    {props.children}
  </button>
  );
}
