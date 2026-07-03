import type { Metadata } from "next";
import { Syne, Plus_Jakarta_Sans } from "next/font/google";
import ThemeRegistry from "@/components/ThemeRegistry";
import SolanaProviders from "@/components/wallet/SolanaProviders";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { Box } from "@mui/material";
import { NextIntlClientProvider } from "next-intl";
import { getMessages } from "next-intl/server";
import "../globals.css";

const syne = Syne({
  subsets: ["latin"],
  variable: "--font-syne",
  weight: ["700", "800"],
});

const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-plus-jakarta-sans",
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "Provify — Prove Every Donation",
  description:
    "Blockchain-powered crowdfunding transparency platform built on Solana. Every donation is recorded on-chain, publicly verifiable, and tamper-proof.",
};

export default async function RootLayout({
  children,
  params,
}: Readonly<{
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}>) {
  const { locale } = await params;
  const messages = await getMessages();

  return (
    <html lang={locale}>
      <body className={`${syne.variable} ${plusJakartaSans.variable}`}>
        <NextIntlClientProvider messages={messages}>
          <ThemeRegistry>
            <SolanaProviders>
              <Box sx={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}>
                <Navbar />
                <Box component="main" sx={{ flexGrow: 1 }}>
                  {children}
                </Box>
                <Footer />
              </Box>
            </SolanaProviders>
          </ThemeRegistry>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
