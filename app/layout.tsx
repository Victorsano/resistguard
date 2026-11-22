import type { Metadata } from 'next';
import './globals.css';
import './product.css';
import './polish.css';
export const metadata:Metadata={title:'ResistGuard · Make every antibiotic decision count',description:'A source-linked antibiotic awareness demo. Scan a package, confirm its ingredient, and learn about responsible antibiotic use.'};
export default function RootLayout({children}:{children:React.ReactNode}){return <html lang="en"><body>{children}</body></html>}
