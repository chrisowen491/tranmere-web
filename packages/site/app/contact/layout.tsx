import "../globals.css";
import "@/public/assets/scss/chat.scss";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link rel="shortcut icon" href="/images/favicon.ico" />
      </head>
      <body className="away">
        
        {children}

      </body>
    </html>
  );
}
