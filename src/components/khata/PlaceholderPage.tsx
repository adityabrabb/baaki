// Purpose: shared placeholder screen: Khata heading plus a loading-then-empty note (PRD §5).
import { EmptyNote } from './EmptyNote';
import { PageHeading } from './PageHeading';
import { StoreGate } from './StoreGate';

export interface PlaceholderPageProps {
   title: string;
   empty: string;
}

/** Why: every route shows the same loading then empty state until its feature slice lands. */
export function PlaceholderPage({ title, empty }: PlaceholderPageProps) {
   return (
      <>
         <PageHeading title={title} />
         <StoreGate>
            <EmptyNote text={empty} />
         </StoreGate>
      </>
   );
}

