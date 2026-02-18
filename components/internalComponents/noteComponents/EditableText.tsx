import { useRef, useEffect, KeyboardEvent } from 'react';

interface EditableTextProps {
    value: string;
    onChange: (val: string) => void;
    onEnter?: () => void;
    onBackspaceEmpty?: () => void;
    placeholder?: string;
    className?: string;
    onInlineCode?: (text: string) => void;
    autoFocus?: boolean;
}

export const EditableText = ({
    value,
    onChange,
    onEnter,
    onBackspaceEmpty,
    placeholder = 'Type something...',
    className = '',
    onInlineCode,
    autoFocus
}: EditableTextProps) => {
    const ref = useRef<HTMLSpanElement>(null);

    useEffect(() => {
        if (ref.current && ref.current.innerText !== value) {
            ref.current.innerText = value;
        }
    }, [value]);

    useEffect(() => {
        if (autoFocus && ref.current) {
            ref.current.focus();
            const range = document.createRange();
            const selection = window.getSelection();
            range.selectNodeContents(ref.current);
            range.collapse(false);
            selection?.removeAllRanges();
            selection?.addRange(range);
        }
    }, []);

    const handleInput = () => {
        if (!ref.current) return;
        const text = ref.current.innerText;

        if (onInlineCode && text.endsWith('/cs')) {
            const stripped = text.slice(0, -3);
            onInlineCode(stripped);
            return;
        }

        onChange(text);
    };

    const handleKeyDown = (e: KeyboardEvent<HTMLSpanElement>) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            onEnter?.();
        }
        if (e.key === 'Backspace' && value === '') {
            e.preventDefault();
            onBackspaceEmpty?.();
        }
    };

    return (
        <span
            ref={ref}
            contentEditable
            suppressContentEditableWarning
            onInput={handleInput}
            onKeyDown={handleKeyDown}
            data-placeholder={placeholder}
            className={`
                outline-none min-w-[4px] whitespace-pre-wrap break-words
                empty:before:content-[attr(data-placeholder)]
                empty:before:text-stone-600
                empty:before:pointer-events-none
                font-semibold
                ${className}
            `}
        />
    );
};