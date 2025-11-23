import { useEffect, useMemo, useRef } from 'react'
import { LexicalComposer } from '@lexical/react/LexicalComposer'
import { RichTextPlugin } from '@lexical/react/LexicalRichTextPlugin'
import { ContentEditable } from '@lexical/react/LexicalContentEditable'
import { HistoryPlugin } from '@lexical/react/LexicalHistoryPlugin'
import { OnChangePlugin } from '@lexical/react/LexicalOnChangePlugin'
import { ListPlugin } from '@lexical/react/LexicalListPlugin'
import { LexicalErrorBoundary } from '@lexical/react/LexicalErrorBoundary'
import { $generateHtmlFromNodes, $generateNodesFromDOM } from '@lexical/html'
import { HeadingNode, QuoteNode } from '@lexical/rich-text'
import { ListItemNode, ListNode } from '@lexical/list'
import {
  $getRoot,
  $createParagraphNode,
  type EditorState,
  type LexicalEditor,
} from 'lexical'
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext'
import ToolbarPlugin from './RichTextToolbar'

interface RichTextEditorProps {
  noteId: string
  value: string
  onChange: (html: string) => void
}

const safeHtml = (value: string) => {
  if (!value) return ''
  if (value.trim().startsWith('<')) return value
  const escaped = value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
  return `<p>${escaped}</p>`
}

function InitialContentPlugin({
  html,
  onHydrated,
  noteId,
}: {
  html: string
  onHydrated: () => void
  noteId: string
}) {
  const [editor] = useLexicalComposerContext()
  const hydratedNoteIdRef = useRef<string | null>(null)

  useEffect(() => {
    if (hydratedNoteIdRef.current === noteId) return
    editor.update(() => {
      const root = $getRoot()
      root.clear()
      if (!html) {
        root.append($createParagraphNode())
        onHydrated()
        hydratedNoteIdRef.current = noteId
        return
      }
      const parser = new DOMParser()
      const dom = parser.parseFromString(html, 'text/html')
      const nodes = $generateNodesFromDOM(editor, dom)
      root.append(...nodes)
      onHydrated()
      hydratedNoteIdRef.current = noteId
    })
  }, [editor, html, noteId, onHydrated])

  return null
}

const readHtml = (
  editorState: EditorState,
  editor: LexicalEditor,
  onChange: (html: string) => void,
) => {
  editorState.read(() => {
    const html = $generateHtmlFromNodes(editor, null)
    onChange(html)
  })
}

function RichTextEditor({ value, onChange, noteId }: RichTextEditorProps) {
  const initialHtml = useMemo(() => safeHtml(value), [value])
  const hydratedRef = useRef(false)
  useEffect(() => {
    hydratedRef.current = false
  }, [noteId])

  const initialConfig = useMemo(
    () => ({
      namespace: 'ChrononotesNoteEditor',
      nodes: [HeadingNode, QuoteNode, ListNode, ListItemNode],
      onError(error: Error) {
        console.error('Lexical error', error)
      },
      editable: true,
    }),
    [],
  )

  return (
    <LexicalComposer
      key={noteId}
      initialConfig={initialConfig}
    >
      <div className="richtext">
        <ToolbarPlugin />
        <div className="richtext__surface">
          <RichTextPlugin
            contentEditable={<ContentEditable className="richtext__editable" />}
            placeholder={
              <div className="richtext__placeholder">Write your note…</div>
            }
            ErrorBoundary={LexicalErrorBoundary}
          />
          <HistoryPlugin />
          <ListPlugin />
          <OnChangePlugin
            onChange={(state, editor) => {
              if (!hydratedRef.current) return
              readHtml(state, editor, (html) => {
                if (html === value) return
                onChange(html)
              })
            }}
          />
          <InitialContentPlugin
            html={initialHtml}
            onHydrated={() => {
              hydratedRef.current = true
            }}
            noteId={noteId}
          />
        </div>
      </div>
    </LexicalComposer>
  )
}

export default RichTextEditor
