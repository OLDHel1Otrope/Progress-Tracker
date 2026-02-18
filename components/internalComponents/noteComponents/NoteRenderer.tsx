import { useState, useCallback, useEffect, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Block, BlockType } from './types/types';
import { Todo } from './ToDo';
import { BulletedText } from './BulletedText';
import { CodeSnippet } from './CodeSnippet';
import { Dropdown } from './DropDown';
import { NumberedText } from './NumberedText';
import { Paragraph } from './Paragraph';
import { Heading } from './Heading';
import { Link } from './Link';
import { fetchNotes, updateNotes } from '@/lib/api/notes';


const BLOCK_TYPES: { type: BlockType; label: string; description: string }[] = [
    { type: 'paragraph', label: 'Text', description: 'Plain text' },
    { type: 'h1', label: 'Heading 1', description: 'Large heading' },
    { type: 'h2', label: 'Heading 2', description: 'Medium heading' },
    { type: 'h3', label: 'Heading 3', description: 'Small heading' },
    { type: 'todo', label: 'To-do', description: 'Checkbox list item' },
    { type: 'bulletedText', label: 'Bulleted list', description: 'Unordered list' },
    { type: 'numberedText', label: 'Numbered list', description: 'Ordered list' },
    { type: 'dropdown', label: 'Toggle', description: 'Collapsible block' },
    { type: 'codeSnippet', label: 'Code block', description: 'Multi-line code' },
    { type: 'link', label: 'Link', description: 'Hyperlink' },
];

const generateId = () => Math.random().toString(36).slice(2, 9);

const makeBlock = (type: BlockType): Block => {
    const block: Block = {
        id: generateId(),
        type,
        data: '',
        checked: false,
        isOpen: true,
        language: 'typescript',
        children: undefined,
    };

    if (type === 'dropdown') {
        block.children = [{
            id: generateId(),
            type: 'paragraph',
            data: '',
        }];
    }

    return block;
};

interface SlashMenuProps {
    query: string;
    onSelect: (type: BlockType) => void;
    onClose: () => void;
}

const SlashMenu = ({ query, onSelect, onClose }: SlashMenuProps) => {
    const filtered = BLOCK_TYPES.filter(
        (b) =>
            b.label.toLowerCase().includes(query.toLowerCase()) ||
            b.description.toLowerCase().includes(query.toLowerCase())
    );

    if (filtered.length === 0) return null;

    return (
        <>
            <div className="fixed inset-0 z-10" onClick={onClose} />
            <div className="absolute z-20 mt-1 w-56 bg-stone-900 border border-stone-700/50 rounded-lg shadow-xl overflow-hidden">
                <div className="px-2 py-1.5 border-b border-stone-700/30">
                    <span className="text-[10px] text-stone-600 uppercase tracking-widest">Insert block</span>
                </div>
                {filtered.map((item) => (
                    <button
                        key={item.type}
                        onMouseDown={(e) => {
                            e.preventDefault();
                            onSelect(item.type);
                        }}
                        className="w-full flex items-center gap-2.5 px-3 py-1 text-left hover:bg-stone-800/60 transition-colors"
                    >
                        <div>
                            <div className="text-sm text-stone-300 font-medium">{item.label}</div>
                            <div className="text-[11px] text-stone-600">{item.description}</div>
                        </div>
                    </button>
                ))}
            </div>
        </>
    );
};

interface BlockWrapperProps {
    children: React.ReactNode;
    onDelete?: () => void;
}

const BlockWrapper = ({ children, onDelete }: BlockWrapperProps) => {
    const [hovered, setHovered] = useState(false);

    return (
        <div
            className="relative flex items-start group"
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => setHovered(false)}
        >
            <div
                className={`
                    absolute -left-6 top-[3px] flex items-center gap-0.5
                    transition-opacity duration-100
                    ${hovered ? 'opacity-100' : 'opacity-0'}
                `}
            >
                <button
                    onClick={onDelete}
                    className="w-4 h-4 flex items-center justify-center text-stone-700 hover:text-stone-400 transition-colors"
                    title="Delete block"
                >
                    <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                        <path d="M2 6H10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                    </svg>
                </button>
            </div>

            <div className="flex-1 min-w-0">
                {children}
            </div>
        </div>
    );
};

interface BlockRendererProps {
    block: Block;
    index: number;
    blocks: Block[];
    numberedCounter: number;
    onChangeBlock: (id: string, updated: Partial<Block>) => void;
    onEnterBlock: (id: string) => void;
    onDeleteBlock: (id: string) => void;
    onInlineCode: (id: string, textBefore: string) => void;
    renderBlocks: (blocks: Block[], parentId?: string) => React.ReactNode;
    autoFocusId?: string;
}

const BlockRenderer = ({
    block,
    index,
    blocks,
    numberedCounter,
    onChangeBlock,
    onEnterBlock,
    onDeleteBlock,
    onInlineCode,
    renderBlocks,
    autoFocusId
}: BlockRendererProps) => {
    const [slashOpen, setSlashOpen] = useState(false);
    const [slashQuery, setSlashQuery] = useState('');

    const handleChange = (updated: Partial<Block>) => {
        if ('data' in updated && typeof updated.data === 'string') {
            const text = updated.data;
            const slashIdx = text.lastIndexOf('/');
            if (slashIdx !== -1) {
                setSlashQuery(text.slice(slashIdx + 1));
                setSlashOpen(true);
            } else {
                setSlashOpen(false);
            }
        }
        onChangeBlock(block.id, updated);
    };

    const handleSlashSelect = (type: BlockType) => {
        const slashIdx = block.data.lastIndexOf('/');
        const cleanedData = slashIdx !== -1 ? block.data.slice(0, slashIdx) : block.data;

        onChangeBlock(block.id, {
            type,
            data: cleanedData,
            children: type === 'dropdown' ? [{
                id: generateId(),
                type: 'paragraph' as BlockType,
                data: '',
            }] : undefined,
        });
        setSlashOpen(false);
    };

    const commonProps = {
        block,
        onChange: handleChange,
        onEnter: () => onEnterBlock(block.id),
        onBackspaceEmpty: () => onDeleteBlock(block.id),
        onInlineCode: (textBefore: string) => onInlineCode(block.id, textBefore),
        autoFocus: block.id === autoFocusId,
    };

    let content: React.ReactNode;

    switch (block.type) {
        case 'todo':
            content = <Todo {...commonProps} />;
            break;
        case 'dropdown':
            content = (
                <Dropdown
                    {...commonProps}
                    renderChildren={(children) => renderBlocks(children, block.id)}
                />
            );
            break;
        case 'codeSnippet':
            content = <CodeSnippet block={block} onChange={handleChange} />;
            break;
        case 'bulletedText':
            content = <BulletedText {...commonProps} />;
            break;
        case 'numberedText':
            content = <NumberedText {...commonProps} number={numberedCounter} />;
            break;
        case 'link':
            content = <Link {...commonProps} />;
            break;
        case 'h1':
        case 'h2':
        case 'h3':
            content = <Heading {...commonProps} />;
            break;
        default:
            content = <Paragraph {...commonProps} />;
    }

    return (
        <div className="relative rounded-md hover:bg-stone-900 p-1 pl-2 font-ubuntu">
            <BlockWrapper onDelete={() => onDeleteBlock(block.id)}>
                {content}
            </BlockWrapper>

            {slashOpen && (
                <SlashMenu
                    query={slashQuery}
                    onSelect={handleSlashSelect}
                    onClose={() => setSlashOpen(false)}
                />
            )}
        </div>
    );
};

// ─── NoteRenderer with React Query ────────────────────────────────────────────
export const NoteRenderer = () => {
    const queryClient = useQueryClient();
    const [lastInsertedId, setLastInsertedId] = useState<string | null>(null);

    const { data: serverBlocks, isLoading } = useQuery({
        queryKey: ['notes'],
        queryFn: fetchNotes,
    });

    const [blocks, setBlocks] = useState<Block[]>([makeBlock('paragraph')]);

    useEffect(() => {
        if (serverBlocks) {
            setBlocks(serverBlocks);
        }
    }, [serverBlocks]);

    const saveMutation = useMutation({
        mutationFn: updateNotes,
        onMutate: async (newBlocks) => {
            await queryClient.cancelQueries({ queryKey: ['notes'] });

            const previousBlocks = queryClient.getQueryData<Block[]>(['notes']);

            queryClient.setQueryData(['notes'], newBlocks);

            return { previousBlocks };
        },
        onError: (err, newBlocks, context) => {
            if (context?.previousBlocks) {
                queryClient.setQueryData(['notes'], context.previousBlocks);
                setBlocks(context.previousBlocks);
            }
            console.error('Failed to save notes:', err);
        },
        onSettled: () => {
            queryClient.invalidateQueries({ queryKey: ['notes'] });
        },
    });

    const debounceTimeoutRef = useRef<NodeJS.Timeout>();
    const debouncedSave = useCallback((blocksToSave: Block[]) => {
        clearTimeout(debounceTimeoutRef.current);
        debounceTimeoutRef.current = setTimeout(() => {
            saveMutation.mutate(blocksToSave);
        }, 1000);
    }, [saveMutation]);

    const updateBlocks = useCallback((newBlocks: Block[]) => {
        setBlocks(newBlocks);
        debouncedSave(newBlocks);
    }, [debouncedSave]);

    const updateBlockById = (list: Block[], id: string, updated: Partial<Block>): Block[] =>
        list.map((b) => {
            if (b.id === id) return { ...b, ...updated };
            if (b.children) return { ...b, children: updateBlockById(b.children, id, updated) };
            return b;
        });

    const insertAfter = (list: Block[], afterId: string, newBlock: Block): Block[] => {
        const idx = list.findIndex((b) => b.id === afterId);
        if (idx !== -1) {
            const next = [...list];
            next.splice(idx + 1, 0, newBlock);
            return next;
        }
        return list.map((b) =>
            b.children
                ? { ...b, children: insertAfter(b.children, afterId, newBlock) }
                : b
        );
    };

    const removeBlock = (list: Block[], id: string): Block[] =>
        list
            .filter((b) => b.id !== id)
            .map((b) =>
                b.children ? { ...b, children: removeBlock(b.children, id) } : b
            );

    const handleChange = (id: string, updated: Partial<Block>) => {
        updateBlocks(updateBlockById(blocks, id, updated));
    };

    const handleEnter = (id: string) => {
        const newBlock = makeBlock('paragraph');
        setLastInsertedId(newBlock.id);
        updateBlocks(insertAfter(blocks, id, newBlock));
    };

    const handleDelete = (id: string) => {
        const newBlocks = removeBlock(blocks, id);
        updateBlocks(newBlocks.length ? newBlocks : [makeBlock('paragraph')]);
    };

    const handleInlineCode = (id: string, textBefore: string) => {
        handleChange(id, {
            data: textBefore,
            type: 'codeSnippetInline' as BlockType,
        });
    };

    const renderBlocks = (list: Block[], parentId?: string): React.ReactNode => {
        let numberedRun = 0;

        return list.map((block, index) => {
            if (block.type === 'numberedText') {
                numberedRun++;
            } else {
                numberedRun = 0;
            }
            const currentNumber = numberedRun;

            return (
                <BlockRenderer
                    key={block.id}
                    block={block}
                    index={index}
                    blocks={list}
                    numberedCounter={currentNumber}
                    onChangeBlock={handleChange}
                    onEnterBlock={handleEnter}
                    onDeleteBlock={handleDelete}
                    onInlineCode={handleInlineCode}
                    renderBlocks={renderBlocks}
                    autoFocusId={lastInsertedId || undefined}
                />
            );
        });
    };

    if (isLoading) {
        return (
            <div className="w-full pl-8 pr-4 py-2 space-y-3">
                {[...Array(5)].map((_, i) => (
                    <div
                        key={i}
                        className="relative rounded-md p-1 pl-2 animate-pulse"
                        style={{ animationDelay: `${i * 100}ms` }}
                    >
                        <div className="flex items-start gap-2">
                            <div className="mt-[3px] w-4 h-4 rounded bg-stone-800/40" />

                            <div className="flex-1 space-y-2">
                                <div
                                    className="h-5 rounded bg-gradient-to-r from-stone-800/20 via-stone-700/40 to-stone-800/20 bg-[length:200%_100%] animate-shimmer"
                                    style={{ width: `${60 + Math.random() * 30}%` }}
                                />
                                {Math.random() > 0.5 && (
                                    <div
                                        className="h-5 rounded bg-gradient-to-r from-stone-800/20 via-stone-700/40 to-stone-800/20 bg-[length:200%_100%] animate-shimmer"
                                        style={{
                                            width: `${40 + Math.random() * 40}%`,
                                            animationDelay: '0.2s'
                                        }}
                                    />
                                )}
                            </div>
                        </div>
                    </div>
                ))}

                <style jsx>{`
                    @keyframes shimmer {
                        0% {
                            background-position: 200% 0;
                        }
                        100% {
                            background-position: -200% 0;
                        }
                    }
                    .animate-shimmer {
                        animation: shimmer 2s ease-in-out infinite;
                    }
                `}</style>
            </div>
        );
    }

    return (
        <div className="relative">
            {/* Save indicator */}
            <div className="fixed bottom-4 right-8 text-xs text-stone-600 z-50">
                {saveMutation.isPending ? (
                    <span className="flex items-center gap-1">
                        <span className="animate-pulse">●</span> Saving...
                    </span>
                ) : saveMutation.isError ? (
                    <span className="text-red-500">Failed to save</span>
                ) : saveMutation.isSuccess ? (
                    <span>Saved</span>
                ) : null}
            </div>

            <div className="w-full pl-8 pr-4 py-2 space-y-0.5">
                {renderBlocks(blocks)}
            </div>
        </div>
    );
};


//we will store notes as json blocks, as a row, this will contain the following columns: id, data, isOpen, type, language, parentId
//this structure will help us in minimizing the data operations in the server side, only changes will be received,
//we are blindly trusting the client to locally maintain the correct data
//also this approach is better since failure points are less because we arnt sending the entire page all the time

//create a query to get all the notes here, this will have all the notes,
//as soon as the data is received add it to the local state


//create a mutation in which we will send a single note updates, before its successful, update the local state
//if unsuccessfull revert the local state
//abandoning this approach