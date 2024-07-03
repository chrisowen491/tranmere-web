import "@/public/assets/scss/chat.scss";

export default function PlayerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link rel="shortcut icon" href="/images/favicon.ico" />
      </head>
      <body className="penpic">
        {children}
      </body>
    </html>
  );
}
