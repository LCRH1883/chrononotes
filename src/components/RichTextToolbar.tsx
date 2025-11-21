import { useCallback } from 'react'
import { INSERT_ORDERED_LIST_COMMAND, INSERT_UNORDERED_LIST_COMMAND } from '@lexical/list'
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext'
import {
  FORMAT_TEXT_COMMAND,
  REDO_COMMAND,
  UNDO_COMMAND,
} from 'lexical'

function RichTextToolbar() {
  const [editor] = useLexicalComposerContext()

  const applyFormat = useCallback(
    (format: 'bold' | 'italic' | 'underline') => {
      editor.dispatchCommand(FORMAT_TEXT_COMMAND, format)
    },
    [editor],
  )

  const insertBulletList = useCallback(() => {
    editor.dispatchCommand(INSERT_UNORDERED_LIST_COMMAND, undefined)
  }, [editor])

  const insertNumberedList = useCallback(() => {
    editor.dispatchCommand(INSERT_ORDERED_LIST_COMMAND, undefined)
  }, [editor])

  return (
    <div className="richtext__toolbar">
      <button
        type="button"
        onClick={() => editor.dispatchCommand(UNDO_COMMAND, undefined)}
        className="richtext__toolbtn"
        title="Undo"
      >
        ↺
      </button>
      <button
        type="button"
        onClick={() => editor.dispatchCommand(REDO_COMMAND, undefined)}
        className="richtext__toolbtn"
        title="Redo"
      >
        ↻
      </button>
      <div className="richtext__divider" />
      <button
        type="button"
        onClick={() => applyFormat('bold')}
        className="richtext__toolbtn"
        title="Bold"
      >
        B
      </button>
      <button
        type="button"
        onClick={() => applyFormat('italic')}
        className="richtext__toolbtn"
        title="Italic"
      >
        I
      </button>
      <button
        type="button"
        onClick={() => applyFormat('underline')}
        className="richtext__toolbtn"
        title="Underline"
      >
        U
      </button>
      <div className="richtext__divider" />
      <button
        type="button"
        onClick={insertBulletList}
        className="richtext__toolbtn"
        title="Bulleted list"
      >
        ••
      </button>
      <button
        type="button"
        onClick={insertNumberedList}
        className="richtext__toolbtn"
        title="Numbered list"
      >
        1.
      </button>
    </div>
  )
}

export default RichTextToolbar
