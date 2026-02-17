import { EditableText } from './EditableText';
import { Block } from './types/types';

interface TodoProps {
    block: Block;
    onChange: (updated: Partial<Block>) => void;
    onEnter?: () => void;
    onBackspaceEmpty?: () => void;
    onInlineCode?: (text: string) => void;
}

export const Todo = ({ block, onChange, onEnter, onBackspaceEmpty, onInlineCode }: TodoProps) => {
    return (
        <div className="flex items-start gap-2 py-0.5 group w-full">
            <button
                onClick={() => onChange({ checked: !block.checked })}
                className={`
                    mt-[3px] flex-shrink-0 w-4 h-4 rounded border transition-all duration-150
                    ${block.checked
                        ? 'bg-stone-400 border-stone-400'
                        : 'border-stone-600 bg-transparent hover:border-stone-400'
                    }
                    flex items-center justify-center
                `}
            >
                {block.checked && (
                    <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
                        <path d="M1 4L3.5 6.5L9 1" stroke="#1c1917" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                )}
            </button>
            <EditableText
                value={block.data}
                onChange={(val) => onChange({ data: val })}
                onEnter={onEnter}
                onBackspaceEmpty={onBackspaceEmpty}
                onInlineCode={onInlineCode}
                placeholder="To-do..."
                className={`
                    flex-1 text-sm leading-6
                    ${block.checked ? 'line-through text-stone-600' : 'text-stone-300'}
                `}
            />
        </div>
    );
};