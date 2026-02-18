import { Block } from './types/types';
import { EditableText } from './EditableText';

interface NumberedTextProps {
    block: Block;
    onChange: (updated: Partial<Block>) => void;
    onEnter?: () => void;
    onBackspaceEmpty?: () => void;
    onInlineCode?: (text: string) => void;
    number: number;
}

export const NumberedText = ({
    block,
    onChange,
    onEnter,
    onBackspaceEmpty,
    onInlineCode,
    number,
}: NumberedTextProps) => {
    return (
        <div className="flex items-start gap-2 py-0.5 w-full">
            <span className="mt-[3px] flex-shrink-0 w-5 text-right text-stone-500 text-sm leading-6 select-none">
                {number}.
            </span>
            <EditableText
                value={block.data}
                onChange={(val) => onChange({ data: val })}
                onEnter={onEnter}
                onBackspaceEmpty={onBackspaceEmpty}
                onInlineCode={onInlineCode}
                placeholder="List item..."
                className="flex-1 text-base leading-6 text-stone-300"
            />
        </div>
    );
};