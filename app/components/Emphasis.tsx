// Renders a heading with its one emphasised word as its own <em>. Headings only; never body, buttons, verdicts or medical text.
export default function Emphasis({text,word}:{text:string;word:string}){
 const at=text.indexOf(word);
 if(!word||at<0)return <>{text}</>;
 return <>{text.slice(0,at)}<em>{word}</em>{text.slice(at+word.length)}</>;
}
