"use client";

import { useEffect, useState, useRef } from "react";
import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import { TextStyle } from "@tiptap/extension-text-style";
import { Bold, Italic, Underline as UnderlineIcon } from "lucide-react";

interface RichTextEditorProps {
  value?: string;
  onChange?: (html: string) => void;
  placeholder?: string;
  minimal?: boolean,
}

export default function RichTextEditor({
  value = "",
  onChange,
  placeholder = "Write something…",
  minimal = false,
}: RichTextEditorProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [menuPos, setMenuPos] = useState<{ x: number; y: number } | null>(null);

  const editor = useEditor({
    extensions: [
      StarterKit,
      Underline,
      TextStyle,
    ],
    content: value,
    immediatelyRender: false,
    editorProps: {
      attributes: {
        class:
          "outline-none bg-transparent text-stone-200 leading-relaxed",
      },
    },
    onUpdate({ editor }) {
      onChange?.(editor.getHTML());
    },
  });

  useEffect(() => {
    if (!editor) return;

    const updateMenu = () => {
      const { from, to } = editor.state.selection;

      if (from === to) {
        setMenuPos(null);
        return;
      }

      const start = editor.view.coordsAtPos(from);
      const end = editor.view.coordsAtPos(to);
      const containerRect =
        containerRef.current?.getBoundingClientRect();

      if (!containerRect) return;

      setMenuPos({
        x: (start.left + end.right) / 2 - containerRect.left,
        y: Math.min(start.top, end.top) - containerRect.top - 8,
      });
    };

    editor.on("selectionUpdate", updateMenu);
    editor.on("blur", () => setMenuPos(null));

    return () => {
      editor.off("selectionUpdate", updateMenu);
    };
  }, [editor]);

  if (!editor) return null;

  return (
    <div ref={containerRef} className="relative w-full">

      {menuPos && (
        <div
          style={{
            left: menuPos.x,
            top: menuPos.y,
            transform: "translate(-50%, -100%)",
            background: minimal ? "transparent" : undefined,
          }}
          className="absolute z-50 flex items-center gap-1 rounded-lg
          bg-stone-900 border border-stone-700 shadow-lg px-1 py-1"
        >
          <ToolbarButton
            active={editor.isActive("bold")}
            onClick={() => editor.chain().focus().toggleBold().run()}
          >
            <Bold size={14} />
          </ToolbarButton>

          <ToolbarButton
            active={editor.isActive("italic")}
            onClick={() => editor.chain().focus().toggleItalic().run()}
          >
            <Italic size={14} />
          </ToolbarButton>

          <ToolbarButton
            active={editor.isActive("underline")}
            onClick={() => editor.chain().focus().toggleUnderline().run()}
          >
            <UnderlineIcon size={14} />
          </ToolbarButton>

          <select
            className="bg-transparent text-xs text-stone-300 outline-none"
            onChange={(e) =>
              editor
                .chain()
                .focus()
                .setMark("textStyle", {
                  fontSize: e.target.value,
                })
                .run()
            }
            defaultValue=""
          >
            <option value="" disabled>
              Size
            </option>
            <option value="12px">Small</option>
            <option value="16px">Normal</option>
            <option value="20px">Large</option>
          </select>
        </div>
      )}

      <EditorContent
        editor={editor}
        className="min-h-[60px] text-base"
      />

      {!editor.getText() && (
        <div className="pointer-events-none absolute top-0 left-0 text-stone-500">
          {placeholder}
        </div>
      )}
    </div>
  );
}


function ToolbarButton({
  children,
  active,
  onClick,
}: {
  children: React.ReactNode;
  active?: boolean;
  onClick?: () => void;
}) {
  return (
    <button
      onMouseDown={(e) => e.preventDefault()}
      onClick={onClick}
      className={`p-1 rounded-md transition
        ${active
          ? "bg-blue-600 text-white"
          : "text-stone-300 hover:bg-stone-700"
        }`}
    >
      {children}
    </button>
  );
}
