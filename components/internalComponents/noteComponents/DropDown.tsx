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
                    <svg width="800px" height="800px" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M15.1997 10.4919L13.2297 8.52188L10.0197 5.31188C9.33969 4.64188 8.17969 5.12188 8.17969 6.08188V12.3119V17.9219C8.17969 18.8819 9.33969 19.3619 10.0197 18.6819L15.1997 13.5019C16.0297 12.6819 16.0297 11.3219 15.1997 10.4919Z" fill="#666666"/>
                    </svg>
                </button>

                <EditableText
                    value={block.data}
                    onChange={(val) => onChange({ data: val })}
                    onEnter={onEnter}
                    onBackspaceEmpty={onBackspaceEmpty}
                    onInlineCode={onInlineCode}
                    placeholder="Toggle..."
                    className="flex-1 text-sm leading-6 text-stone-300 font-medium"
                />
            </div>
            {isOpen && (
                <div className="ml-5 pl-3 border-l border-stone-700/50">
                    {renderChildren?.(block.children ?? [], block.id)}
                    {(!block.children || block.children.length === 0) && (
                        <div className="py-1 text-xs text-stone-600 italic">Empty toggle</div>
                    )}
                </div>
            )}
        </div>
    );
};