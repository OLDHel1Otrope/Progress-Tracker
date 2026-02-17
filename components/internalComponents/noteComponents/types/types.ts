export type BlockType =
    | 'todo'
    | 'dropdown'
    | 'codeSnippet'
    | 'codeSnippetInline'
    | 'bulletedText'
    | 'numberedText'
    | 'link'
    | 'h1'
    | 'h2'
    | 'h3'
    | 'paragraph';

export interface Block {
    id: string;
    type: BlockType;
    data: string;
    checked?: boolean;
    isOpen?: boolean;
    language?: string;
    url?: string;
    children?: Block[];
    number?: number;
}
