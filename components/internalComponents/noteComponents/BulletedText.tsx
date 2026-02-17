import { Block } from './types/types';
import { EditableText } from './EditableText';

interface BulletedTextProps {
    block: Block;
    onChange: (updated: Partial<Block>) => void;
    onEnter?: () => void;
    onBackspaceEmpty?: () => void;
    onInlineCode?: (text: string) => void;
    depth?: number;
}

export const BulletedText = ({
    block,
    onChange,
    onEnter,
    onBackspaceEmpty,
    onInlineCode,
    depth = 0,
}: BulletedTextProps) => {
    const bulletStyles = ['•', '◦', '▸'];
    const bullet = bulletStyles[Math.min(depth, bulletStyles.length - 1)];

    return (
        <div className="flex items-start gap-2 py-0.5 w-full">
            <span className="mt-[3px] flex-shrink-0 w-4 text-center text-stone-500 text-sm leading-6 select-none">
                {bullet}
            </span>
            <EditableText
                value={block.data}
                onChange={(val) => onChange({ data: val })}
                onEnter={onEnter}
                onBackspaceEmpty={onBackspaceEmpty}
                onInlineCode={onInlineCode}
                placeholder="List item..."
                className="flex-1 text-sm leading-6 text-stone-300"
            />
        </div>
    );
};