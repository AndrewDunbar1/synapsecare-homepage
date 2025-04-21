import { Html, Head, Main, NextScript } from 'next/document'

export default function Document() {
  return (
    <Html lang="en">
      <Head>
        <link rel="preconnect" href="https://cdnjs.cloudflare.com" crossOrigin="anonymous" />
        <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/tailwindcss/2.2.19/tailwind.min.css" integrity="sha512-wnea99uKIC3TJF7v4eKk4Y+lMz2Mklv18+r4na2Gn1abDRPPOeef95xTzdwGD9e6zXJBteMIhZ1+68QC5byJZw==" crossOrigin="anonymous" referrerPolicy="no-referrer" />
        {/* Base tag for GitHub Pages */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                if (window.location.hostname !== 'localhost') {
                  var base = document.createElement('base');
                  base.href = '/synapsecare-homepage/';
                  document.head.prepend(base);
                }
              })();
            `,
          }}
        />
      </Head>
      <body className="bg-black text-white">
        <Main />
        <NextScript />
      </body>
    </Html>
  )
} 