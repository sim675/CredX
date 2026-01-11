import "./globals.css";
import { Web3Provider } from "@/components/providers/web3-provider";
// import localFont from 'next/font/local'

// Temporarily commented out until font file is available
// const pirateKeg = localFont({
//   src: './public/fonts/PirateKeg.woff2', // Path from project root
//   variable: '--font-pirate-keg',
// })

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <Web3Provider>
          {children}
        </Web3Provider>
      </body>
    </html>
  );
}
