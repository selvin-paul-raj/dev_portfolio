import type { Metadata } from "next";
import Script from "next/script";

import "./globals.css";
import Header from "@/components/Header";
import ActiveSectionContextProvider from "@/context/active-section-context";
import { Toaster } from "react-hot-toast";
import Footer from "@/components/Footer";
import ThemeSwitch from "@/components/ThemeSwitch";
import ThemeContextProvider from "@/context/theme-context";
import { SpeedInsights } from "@vercel/speed-insights/next";




export const metadata: Metadata = {
  icons:{
    icon: "/profile.png",
    shortcut: "/profile.png",
    
  },
  title: "Selvin PaulRaj | Portfolio",
  description: "Selvin PaulRaj K is a full-stack MERN web developer based india.",
  verification:{
    google: "y8_t3SKugG2qZzqDFrgclLRNRh5m62dhX-OTUWKlthc",
  },
  
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body
        className={` bg-[#FAFAF9] text-gray-950 relative pt-20 dark:bg-[#000] dark:text-white dark:text-opacity-80 `}
      >
        <script
        dangerouslySetInnerHTML={{
          __html: `(function(c,l,a,r,i,t,y){
            c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};
            t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;
            y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);
          })(window, document, "clarity", "script", "oo7sqjfgyt");`
        }}
      />
        <Script
        src="https://www.googletagmanager.com/gtag/js?id=G-3P168T3CC1"
        strategy="afterInteractive"
      />
      {/* Configure Google Analytics */}
      <Script id="google-analytics" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', 'G-3P168T3CC1');
        `}
      </Script>
        <div className="bg-[#805c8b] absolute top-[-6rem] -z-10 right-[11rem] h-[31.25rem] w-[31.25rem] rounded-full blur-[10rem] sm:w-[68.75rem] dark:bg-[#000]"></div>
        <div className="bg-[#CDECFF] absolute top-[-1rem] -z-10 left-[-35rem] h-[31.25rem] w-[50rem] rounded-full blur-[10rem] sm:w-[68.75rem] md:left-[-33rem] lg:left-[-28rem] xl:left-[-15rem] 2xl:left-[-5rem] dark:bg-[#000]"></div>

        <ThemeContextProvider>
          <ActiveSectionContextProvider>
            <Header />
            {children}
            <SpeedInsights />
            <Toaster position="top-right" />
            <Footer />
            <ThemeSwitch />
          </ActiveSectionContextProvider>
        </ThemeContextProvider>
      </body>
    </html>
  );
}
