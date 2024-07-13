import Link from "next/link";

export default function NotFound() {
  return (
    <>
              <p>Could not find requested player</p>
              <Link href="/">Return Home</Link>

    </>
  );
}
