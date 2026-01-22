import React, { useEffect, useMemo, useRef } from 'react';
import Editor, { type OnMount } from '@monaco-editor/react';
import type { editor as MonacoEditor } from 'monaco-editor';
import { nanoid } from 'nanoid';
import { putAsset } from '../storage/db';
import { MODANG_ASSET_PREFIX } from '../markdown/assets';

export function EditorPane(props: {
  value: string;
  onChange: (value: string) => void;
  theme: 'vs' | 'vs-dark';
}) {
  const editorRef = useRef<MonacoEditor.IStandaloneCodeEditor | null>(null);

  const options = useMemo<MonacoEditor.IStandaloneEditorConstructionOptions>(
    () => ({
      minimap: { enabled: false },
      wordWrap: 'on',
      fontSize: 14,
      scrollBeyondLastLine: false,
      smoothScrolling: true,
      padding: { top: 10, bottom: 10 },
      automaticLayout: true,
    }),
    [],
  );

  const onMount: OnMount = (editor) => {
    editorRef.current = editor;
  };

  useEffect(() => {
    const editor = editorRef.current;
    if (!editor) return;

    const dom = editor.getDomNode();
    if (!dom) return;

    const onPaste = async (e: ClipboardEvent) => {
      const dt = e.clipboardData;
      if (!dt) return;

      const imageItem = Array.from(dt.items).find(
        (it) => it.kind === 'file' && it.type.startsWith('image/'),
      );
      if (!imageItem) return; // let default text paste

      const file = imageItem.getAsFile();
      if (!file) return;

      e.preventDefault();

      const id = nanoid();
      await putAsset({ id, mime: file.type || 'image/png', data: file, createdAt: Date.now() });

      const snippet = `![pasted-image](${MODANG_ASSET_PREFIX}${id})`;
      const monaco = editor;
      const selection = monaco.getSelection();
      const model = monaco.getModel();
      const pos = monaco.getPosition();
      if (!model) return;

      const range =
        selection ??
        (pos
          ? {
              startLineNumber: pos.lineNumber,
              startColumn: pos.column,
              endLineNumber: pos.lineNumber,
              endColumn: pos.column,
            }
          : model.getFullModelRange());

      monaco.executeEdits('modang-paste-image', [
        {
          range,
          text: snippet,
          forceMoveMarkers: true,
        },
      ]);
      monaco.focus();

      // Update outer state
      const text = monaco.getValue();
      props.onChange(text);
    };

    dom.addEventListener('paste', onPaste);
    return () => dom.removeEventListener('paste', onPaste);
  }, [props]);

  return (
    <Editor
      height="100%"
      defaultLanguage="markdown"
      value={props.value}
      onChange={(v) => props.onChange(v ?? '')}
      onMount={onMount}
      options={options}
      theme={props.theme}
    />
  );
}
