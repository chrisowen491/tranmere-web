"use client";

import { FlipbookViewer } from "react-pdf-flipbook-viewer";

export function FlipBook({
  bookPath,
  className,
  disableShare = true,
}: {
  bookPath: string;
  className?: string;
  disableShare?: boolean;
}) {
  return (
    <div className="block bg-[#071a2b]">
      <FlipbookViewer
        pdfUrl={bookPath}
        className={className}
        disableShare={disableShare}
      />
    </div>
  );
}
