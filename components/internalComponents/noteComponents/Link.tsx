import { useState } from 'react';
import { Block } from './types/types';
import { EditableText } from './EditableText';

interface LinkProps {
    block: Block;
    onChange: (updated: Partial<Block>) => void;
    onEnter?: () => void;
    onBackspaceEmpty?: () => void;
}

export const Link = ({ block, onChange, onEnter, onBackspaceEmpty }: LinkProps) => {
    const [isEditingUrl, setIsEditingUrl] = useState(!block.url);

    return (
        <div className="flex items-center gap-1.5 py-0.5 w-full group">
            <span className="flex-shrink-0 text-stone-500 mt-[2px]">
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                    <path d="M5.5 8.5L8.5 5.5M6 3.5L7.5 2C8.6 0.9 10.4 0.9 11.5 2C12.6 3.1 12.6 4.9 11.5 6L10 7.5M7.5 10.5L6 12C4.9 13.1 3.1 13.1 2 12C0.9 10.9 0.9 9.1 2 8L3.5 6.5"
                        stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
                </svg>
            </span>

            <EditableText
                value={block.data}
                onChange={(val) => onChange({ data: val })}
                onEnter={onEnter}
                onBackspaceEmpty={onBackspaceEmpty}
                placeholder="Link text..."
                className={`
                    text-base leading-6 text-stone-400 underline underline-offset-2
                    decoration-stone-600 hover:text-stone-200 hover:decoration-stone-400
                    transition-colors cursor-pointer
                `}
            />

            {isEditingUrl ? (
                <input
                    type="text"
                    value={block.url ?? ''}
                    onChange={(e) => onChange({ url: e.target.value })}
                    onBlur={() => setIsEditingUrl(false)}
                    onKeyDown={(e) => e.key === 'Enter' && setIsEditingUrl(false)}
                    autoFocus
                    placeholder="Paste URL..."
                    className="
                        ml-2 px-2 py-0.5 text-xs rounded
                        bg-stone-800 border border-stone-600/50
                        text-stone-300 outline-none
                        placeholder:text-stone-600
                        w-48
                    "
                />
            ) : (
                <button
                    onClick={() => setIsEditingUrl(true)}
                    className="ml-1 opacity-0 group-hover:opacity-100 transition-opacity text-xs text-stone-600 hover:text-stone-400"
                >
                    {block.url ? 'edit' : 'add url'}
                </button>
            )}

            {block.url && !isEditingUrl && (
                <a
                    href={block.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="opacity-0 group-hover:opacity-100 transition-opacity text-stone-600 hover:text-stone-400 ml-0.5"
                >
                    <svg width="11" height="11" viewBox="0 0 11 11" fill="none">
                        <path d="M4.5 2H2C1.4 2 1 2.4 1 3V9C1 9.6 1.4 10 2 10H8C8.6 10 9 9.6 9 9V6.5M6.5 1H10M10 1V4.5M10 1L5 6"
                            stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                </a>
            )}
        </div>
    );
};