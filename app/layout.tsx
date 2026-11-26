import type {Metadata,Viewport} from 'next';
import {Bricolage_Grotesque,Fraunces} from 'next/font/google';
import './tokens.css';
import './globals.css';
// Bricolage Grotesque carries every word; its width and optical-size axes give the hierarchy.
const bricolage=Bricolage_Grotesque({subsets:['latin'],axes:['opsz','wdth'],variable:'--font-bricolage',display:'swap'});
// Fraunces italic is only for the one emphasised word in a heading.
const fraunces=Fraunces({subsets:['latin'],style:'italic',axes:['opsz','SOFT','WONK'],variable:'--font-fraunces',display:'swap'});
export const metadata:Metadata={title:'ResistGuard · Know what’s in the pack before you take it',description:'Snap the label. Our AI tells you if it’s an antibiotic, and a pharmacist is one tap away.'};
export const viewport:Viewport={themeColor:'#0B0D10'};
export default function RootLayout({children}:{children:React.ReactNode}){return <html lang="en" className={`${bricolage.variable} ${fraunces.variable}`}><body>{children}</body></html>}
