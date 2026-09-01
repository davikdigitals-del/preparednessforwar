import { useEffect, useRef, useImperativeHandle, forwardRef } from "react";
import { EditorView } from "@codemirror/view";
import { EditorState } from "@codemirror/state";
import { html } from "@codemirror/lang-html";
import { oneDark } from "@codemirror/theme-one-dark";
import { history } from "@codemirror/commands";

interface CodeEditorProps {
    defaultValue?: string;
    placeholder?: string;
}

export interface CodeEditorHandle {
    getValue: () => string;
    setValue: (value: string) => void;
}

export const CodeEditor = forwardRef<CodeEditorHandle, CodeEditorProps>(
    ({ defaultValue = "", placeholder = "" }, ref) => {
        const editorRef = useRef<HTMLDivElement>(null);
        const viewRef = useRef<EditorView | null>(null);

        useImperativeHandle(ref, () => ({
            getValue: () => {
                return viewRef.current?.state.doc.toString() || "";
            },
            setValue: (value: string) => {
                if (viewRef.current) {
                    viewRef.current.dispatch({
                        changes: {
                            from: 0,
                            to: viewRef.current.state.doc.length,
                            insert: value,
                        },
                    });
                }
            },
        }));

        useEffect(() => {
            if (!editorRef.current) return;

            const state = EditorState.create({
                doc: defaultValue,
                extensions: [
                    html(),
                    oneDark,
                    history(),
                    EditorView.lineWrapping,
                    EditorView.theme({
                        "&": {
                            fontSize: "13px",
                            fontFamily: "monospace",
                        },
                        ".cm-scroller": {
                            fontFamily: "monospace",
                        },
                    }),
                ],
            });

            const view = new EditorView({
                state,
                parent: editorRef.current,
            });

            viewRef.current = view;

            return () => {
                view.destroy();
            };
        }, []);

        return (
            <div
                ref={editorRef}
                style={{
                    border: "1px solid #374151",
                    borderRadius: "6px",
                    overflow: "hidden",
                    minHeight: "400px",
                }}
            />
        );
    }
);

CodeEditor.displayName = "CodeEditor";
