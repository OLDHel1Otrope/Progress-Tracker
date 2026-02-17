interface CodeSnippetInlineProps {
    value: string;
    onChange: (val: string) => void;
}

export const CodeSnippetInline = ({ value, onChange }: CodeSnippetInlineProps) => {
    return (
        <code
            contentEditable
            suppressContentEditableWarning
            onBlur={(e) => onChange(e.currentTarget.innerText)}
            className="
                inline px-1.5 py-0.5 mx-0.5
                rounded font-mono text-[0.85em]
                bg-stone-800/80 text-stone-300
                border border-stone-700/40
                outline-none
            "
        >
            {value}
        </code>
    );
};