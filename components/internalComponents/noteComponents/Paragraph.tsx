import { Block } from './types/types';
import { EditableText } from './EditableText';

interface ParagraphProps {
    block: Block;
    onChange: (updated: Partial<Block>) => void;
    onEnter?: () => void;
    onBackspaceEmpty?: () => void;
    onInlineCode?: (text: string) => void;
    autoFocus?: boolean;
}

export const Paragraph = ({ block, onChange, onEnter, onBackspaceEmpty, onInlineCode,autoFocus }: ParagraphProps) => {
    return (
        <div className="w-full py-0.5">
            <EditableText
                value={block.data}
                onChange={(val) => onChange({ data: val })}
                onEnter={onEnter}
                onBackspaceEmpty={onBackspaceEmpty}
                onInlineCode={onInlineCode}
                placeholder="Type '/' for commands..."
                className="block w-full text-sm leading-6 text-stone-300"
                autoFocus={autoFocus}
            />
        </div>
    );
};