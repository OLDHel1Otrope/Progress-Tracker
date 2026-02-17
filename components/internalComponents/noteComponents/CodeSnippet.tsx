import { useState } from 'react';
import { Block } from './types/types';

interface CodeSnippetProps {
    block: Block;
    onChange: (updated: Partial<Block>) => void;
}

const LANGUAGES = ['typescript', 'javascript', 'python', 'bash', 'sql', 'json', 'css', 'html'];

export const CodeSnippet = ({ block, onChange }: CodeSnippetProps) => {
    const [copied, setCopied] = useState(false);

    const handleCopy = () => {
        navigator.clipboard.writeText(block.data);
        setCopied(true);
        setTimeout(() => setCopied(false), 1500);
    };

    return (
        <div className="w-full my-1 rounded-lg overflow-hidden border border-stone-700/40 bg-stone-900/60">
            <div className="flex items-center justify-between px-3 py-1.5 bg-stone-800/60 border-b border-stone-700/30">
                <select
                    value={block.language ?? 'typescript'}
                    onChange={(e) => onChange({ language: e.target.value })}
                    className="text-xs text-stone-600 bg-transparent border-none outline-none cursor-pointer hover:text-stone-400 transition-colors"
                >
                    {LANGUAGES.map((lang) => (
                        <option key={lang} value={lang} className="bg-stone-900">
                            {lang}
                        </option>
                    ))}
                </select>

                <button
                    onClick={handleCopy}
                    className="text-xs text-stone-500 hover:text-stone-300 transition-colors"
                >
                    {copied ? 'Copied!' : 'Copy'}
                </button>
            </div>

            {/* Code area */}
            <div className="relative">
                {/* Line numbers */}
                <div className="absolute left-0 top-0 bottom-0 w-10 flex flex-col items-end pr-2 pt-3 pb-3 pointer-events-none select-none">
                    {(block.data || '').split('\n').map((_, i) => (
                        <div key={i} className="text-[11px] leading-5 text-stone-700">
                            {i + 1}
                        </div>
                    ))}
                </div>

                <textarea
                    value={block.data}
                    onChange={(e) => onChange({ data: e.target.value })}
                    spellCheck={false}
                    rows={Math.max(3, (block.data || '').split('\n').length)}
                    placeholder="// Write your code here..."
                    className="
                        w-full pl-12 pr-4 py-3
                        bg-transparent text-stone-300
                        font-mono text-[13px] leading-5
                        outline-none resize-none
                        placeholder:text-stone-700
                    "
                />
            </div>
        </div>
    );
};