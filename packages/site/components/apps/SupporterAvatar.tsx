import { UserCircleIcon } from "@heroicons/react/24/outline";
import Image from "next/image";

export function SupporterAvatar({
  avatarUrl,
  label = "Supporter avatar",
  className = "h-16 w-16",
}: {
  avatarUrl?: string | null;
  label?: string;
  className?: string;
}) {
  return (
    <div
      className={`${className} flex shrink-0 items-center justify-center overflow-hidden border border-[#071a2b]/15 bg-[#e8e2d6]`}
    >
      {avatarUrl ? (
        <Image
          src={avatarUrl}
          alt={label}
          width={240}
          height={240}
          unoptimized
          className="h-full w-full object-cover"
        />
      ) : (
        <UserCircleIcon className="h-3/4 w-3/4 text-blue-700" aria-hidden />
      )}
    </div>
  );
}
