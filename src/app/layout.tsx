// Purpose: root layout; wires fonts, skip link, notebook page, store provider and navigation.
import type { Metadata } from 'next';
import { Suspense } from 'react';
import './globals.css';
import { RuledPage } from '../components/khata/RuledPage';
import { Spine } from '../components/nav/Spine';
import { SkipLink } from '../components/nav/SkipLink';
import { TabBar } from '../components/nav/TabBar';
import {
   APP_DESCRIPTION,
   APP_TITLE,
   MAIN_CONTENT_ID,
} from '../lib/constants';
import { StoreProvider } from '../lib/store/StoreProvider';
import { anton, hind, kalam } from './fonts';

export const metadata: Metadata = {
   title: APP_TITLE,
   description: APP_DESCRIPTION,
};

/** Why: the shell is server-rendered; only the store and nav are client code. */
export default function RootLayout({ children }: LayoutProps<'/'>) {
   return (
      <html
         lang="en"
         className={`${anton.variable} ${kalam.variable} ${hind.variable} h-full antialiased`}
      >
         <body className="flex min-h-full flex-col">
            <StoreProvider>
               <SkipLink />
               <RuledPage>
                  <Suspense fallback={null}>
                     <Spine />
                  </Suspense>
                  <div className="flex flex-1 flex-col">
                     <main
                        id={MAIN_CONTENT_ID}
                        tabIndex={-1}
                        className="flex-1 px-4 pb-28 pt-6 md:pb-10 md:pl-16 md:pr-8 lg:max-w-[75rem]"
                     >
                        <Suspense fallback={null}>{children}</Suspense>
                     </main>
                  </div>
                  <Suspense fallback={null}>
                     <TabBar />
                  </Suspense>
               </RuledPage>
            </StoreProvider>
         </body>
      </html>
   );
}
