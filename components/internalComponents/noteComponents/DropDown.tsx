import { Block } from './types/types';
import { EditableText } from './EditableText';

interface DropdownProps {
    block: Block;
    onChange: (updated: Partial<Block>) => void;
    onEnter?: () => void;
    onBackspaceEmpty?: () => void;
    onInlineCode?: (text: string) => void;
    renderChildren?: (blocks: Block[], parentId: string) => React.ReactNode;
}

export const Dropdown = ({
    block,
    onChange,
    onEnter,
    onBackspaceEmpty,
    onInlineCode,
    renderChildren,
}: DropdownProps) => {
    const isOpen = block.isOpen ?? false;

    return (
        <div className="w-full">
            <div className="flex items-start gap-1.5 py-0.5 group w-full">
                <button
                    onClick={() => onChange({ isOpen: !isOpen })}
                    className={`
                        mt-[4px] flex-shrink-0 w-4 h-4 flex items-center justify-center
                        text-stone-500 hover:text-stone-300 transition-all duration-150
                        ${isOpen ? 'rotate-90' : 'rotate-0'}
                    `}
                >
                    <svg width="8" height="10" viewBox="0 0 8 10" fill="none">
                        <path
                            d="M1 1L7 5L1 9"
                            stroke="currentColor"
                            strokeWidth="1.5"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                        />
                    </svg>
                </button>

                <EditableText
                    value={block.data}
                    onChange={(val) => onChange({ data: val })}
                    onEnter={onEnter}
                    onBackspaceEmpty={onBackspaceEmpty}
                    onInlineCode={onInlineCode}
                    placeholder="Toggle..."
                    className="flex-1 text-base leading-6 text-stone-300 font-medium"
                />
            </div>
            {isOpen && (
                <div className="ml-5 pl-3 ">
                    {renderChildren?.(block.children ?? [], block.id)}
                    {(!block.children || block.children.length === 0) && (
                        <div className="py-1 text-xs text-stone-600 italic">Empty toggle</div>
                    )}
                </div>
            )}
        </div>
    );
};