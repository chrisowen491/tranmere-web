import { ButtonHTMLAttributes } from "react";

const Button = ({
  className,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement>) => {
  return (
    <button
      className={`hidden group-hover:flex absolute top-1/2 -translate-x-0 -translate-y-1/2 rounded-full items-center justify-center text-white bg-black/50 h-12 w-12 ${className}`}
      {...props}
    >
      {props.children}
    </button>
  );
};

export default Button;
