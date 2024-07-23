import { StarIcon } from "@heroicons/react/20/solid";

export function Reviews(props: {
  text: string;
  avg: number;
  count: number;
  className?: string;
}) {
  const { text = props.text } = props;

  const avg = props.avg | 0;
  function classNames(...classes: string[]) {
    return classes.filter(Boolean).join(" ");
  }

  return (
    <div className={`mt-4 text-gray-700 dark:text-gray-50 ${props.className}`}>
      <h2 className="sr-only">{text}</h2>
      <div className="flex items-center">
        <p className="text-sm">
          {avg}
          <span className="sr-only"> out of 5 stars</span>
        </p>
        <div className="ml-1 flex items-center">
          {[0, 1, 2, 3, 4].map((rating) => (
            <StarIcon
              key={rating}
              aria-hidden="true"
              className={classNames(
                props.avg > rating ? "text-yellow-400" : "text-gray-200",
                "h-5 w-5 flex-shrink-0",
              )}
            />
          ))}
        </div>
        <div className="ml-4 flex">
          <p className="text-sm font-medium">Based on {props.count} reviews</p>
        </div>
      </div>
    </div>
  );
}
