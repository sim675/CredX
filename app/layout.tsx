import "./globals.css";
// Essential: RainbowKit styles must be imported here for the UI to render correctly
import "@rainbow-me/rainbowkit/styles.css"; 
import { Web3Provider } from "@/components/providers/web3-provider";
import { Inter } from "next/font/google";

// Standard Google font for professional UI
const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "CredX",
  description: "Decentralized invoice financing for MSMEs and Investors",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        {/* WRAPPER LOGIC: 
          By placing Web3Provider here, we ensure that EVERY page and 
          EVERY nested layout (like app/dashboard/layout.tsx) is a 
          child of the WagmiProvider. This fixes the 'useConfig must 
          be used within WagmiProvider' error.
        */}
        <Web3Provider>
          {children}
        </Web3Provider>
      </body>
    </html>
  );
}