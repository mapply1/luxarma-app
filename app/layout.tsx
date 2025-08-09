import './globals.css';
import type { Metadata } from 'next';
import { Toaster } from 'sonner';
import { IconoirProvider } from 'iconoir-react';
import { ReactQueryProvider } from '@/lib/react-query';
import { ErrorBoundary } from '@/components/error-boundary';

export const metadata: Metadata = {
  metadataBase: new URL('https://luxarma-app.netlify.app'),
  title: 'Luxarma - Gestion de Projets',
  description: 'Plateforme de gestion de projets pour agences créatives - Solution professionnelle pour la gestion de projets créatifs',
  keywords: 'gestion projets, agence créative, CRM, suivi projets, collaboration client',
  authors: [{ name: 'Luxarma' }],
  creator: 'Luxarma',
  publisher: 'Luxarma',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    locale: 'fr_FR',
    url: 'https://luxarma-app.netlify.app',
    title: 'Luxarma - Gestion de Projets',
    description: 'Plateforme professionnelle de gestion de projets pour agences créatives',
    siteName: 'Luxarma',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Luxarma - Gestion de Projets',
    description: 'Plateforme professionnelle de gestion de projets pour agences créatives',
  },
  viewport: {
    width: 'device-width',
    initialScale: 1,
    maximumScale: 1,
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr">
      <body className="font-onest antialiased">
        <ErrorBoundary>
          <IconoirProvider
            iconProps={{
              color: "currentColor",
              width: "1.5em",
              height: "1.5em",
            }}
          >
            <ReactQueryProvider>
              {children}
              <Toaster 
                position="top-right" 
                toastOptions={{
                  duration: 4000,
                  style: {
                    background: 'white',
                    color: 'black',
                    border: '1px solid #e5e7eb',
                  },
                }}
              />
            </ReactQueryProvider>
          </IconoirProvider>
        </ErrorBoundary>
      </body>
    </html>
  );
}