import Link from "next/link";

export default function NotFound() {
  return (
    <>
      <p>Could not find requested match</p>
      <Link href="/">Return Home</Link>
    </>
  );
}
