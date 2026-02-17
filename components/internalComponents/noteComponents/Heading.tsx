import { Block } from './types/types';
import { EditableText } from './EditableText';

interface HeadingProps {
    block: Block;
    onChange: (updated: Partial<Block>) => void;
    onEnter?: () => void;
    onBackspaceEmpty?: () => void;
    onInlineCode?: (text: string) => void;
}

const headingStyles: Record<string, string> = {
    h1: 'text-2xl font-bold text-stone-100 tracking-tight pt-6 pb-1',
    h2: 'text-xl font-semibold text-stone-200 tracking-tight pt-4 pb-0.5',
    h3: 'text-base font-semibold text-stone-300 tracking-tight pt-3 pb-0.5',
};

const placeholders: Record<string, string> = {
    h1: 'Heading 1',
    h2: 'Heading 2',
    h3: 'Heading 3',
};

export const Heading = ({ block, onChange, onEnter, onBackspaceEmpty, onInlineCode }: HeadingProps) => {
    const style = headingStyles[block.type] ?? headingStyles.h1;
    const placeholder = placeholders[block.type] ?? 'Heading';

    return (
        <div className="w-full">
            <EditableText
                value={block.data}
                onChange={(val) => onChange({ data: val })}
                onEnter={onEnter}
                onBackspaceEmpty={onBackspaceEmpty}
                onInlineCode={onInlineCode}
                placeholder={placeholder}
                className={`block w-full ${style}`}
            />
        </div>
    );
};