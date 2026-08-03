import { useEffect, useRef, useState, type FocusEvent } from 'react';

interface Props {
  value:        string;
  onChange:     (html: string) => void;
  placeholder?: string;
  minHeight?:   number;
}

const FONTS = [
  { label: 'Default',    value: 'inherit' },
  { label: 'Serif',      value: 'Georgia, "Times New Roman", serif' },
  { label: 'Sans-serif', value: 'Arial, Helvetica, sans-serif' },
  { label: 'Monospace',  value: '"Courier New", monospace' },
  { label: 'Rounded',    value: '"Trebuchet MS", sans-serif' },
];

const SIZES = ['1', '2', '3', '4', '5', '6', '7']; // execCommand fontSize scale

// Wraps document.execCommand — deprecated but still the simplest reliable way
// to get inline WYSIWYG formatting (bold/italic/underline/font) without a
// third-party editor dependency, and it's what every lightweight admin
// content box like this one uses under the hood.
function exec(command: string, value?: string): void {
  document.execCommand(command, false, value);
}

export default function RichTextEditor({ value, onChange, placeholder, minHeight = 200 }: Props): JSX.Element {
  const ref              = useRef<HTMLDivElement>(null);
  const [fontSize, setFontSize] = useState('3');
  const [active,   setActive]   = useState<{ bold?: boolean; italic?: boolean; underline?: boolean }>({});

  // Populate the editor with existing content when it changes from outside
  // (e.g. when opening the Edit modal / edit page for a post that already
  // has content) — without clobbering the user's cursor while they type.
  useEffect(() => {
    if (ref.current && ref.current.innerHTML !== value) {
      ref.current.innerHTML = value || '';
    }
    // Only re-sync when the *external* value changes, not on every keystroke.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  const syncActiveStates = (): void => {
    try {
      setActive({
        bold:      document.queryCommandState('bold'),
        italic:    document.queryCommandState('italic'),
        underline: document.queryCommandState('underline'),
      });
    } catch { /* ignore in unsupported browsers */ }
  };

  const handleInput = (): void => {
    onChange(ref.current?.innerHTML ?? '');
  };

  const run = (command: string, val?: string): void => {
    ref.current?.focus();
    exec(command, val);
    syncActiveStates();
    handleInput();
  };

  const bumpFontSize = (dir: 1 | -1): void => {
    const next = String(Math.min(7, Math.max(1, Number(fontSize) + dir)));
    setFontSize(next);
    run('fontSize', next);
  };

  const handleBlur = (_e: FocusEvent<HTMLDivElement>): void => {
    handleInput();
  };

  const btn = (label: string, cmd: string, isActive?: boolean, title?: string) => (
    <button
      type="button"
      title={title ?? label}
      onMouseDown={e => e.preventDefault()} // keep focus/selection in the editor
      onClick={() => run(cmd)}
      className={`w-8 h-8 flex items-center justify-center rounded-md text-sm font-semibold border transition-all cursor-pointer font-body ${
        isActive
          ? 'bg-accent/20 border-accent text-accent'
          : 'bg-surface2 border-border text-white hover:border-accent hover:text-accent'
      }`}
    >
      {label}
    </button>
  );

  return (
    <div className="rounded-xl border border-border overflow-hidden bg-surface2/40">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-1.5 p-2 border-b border-border bg-surface2">
        {btn('B', 'bold', active.bold, 'Bold')}
        <span className="italic">{btn('I', 'italic', active.italic, 'Italic')}</span>
        {btn('U', 'underline', active.underline, 'Underline')}

        <span className="w-px h-6 bg-border mx-1" />

        <select
          onMouseDown={e => e.stopPropagation()}
          onChange={e => run('fontName', e.target.value)}
          defaultValue="inherit"
          title="Font family"
          className="input-field text-xs py-1.5 w-32"
        >
          {FONTS.map(f => (
            <option key={f.value} value={f.value} style={{ fontFamily: f.value }}>{f.label}</option>
          ))}
        </select>

        <span className="w-px h-6 bg-border mx-1" />

        <button
          type="button"
          title="Decrease font size"
          onMouseDown={e => e.preventDefault()}
          onClick={() => bumpFontSize(-1)}
          className="w-8 h-8 flex items-center justify-center rounded-md text-sm font-semibold border bg-surface2 border-border text-white hover:border-accent hover:text-accent cursor-pointer font-body"
        >
          A−
        </button>
        <button
          type="button"
          title="Increase font size"
          onMouseDown={e => e.preventDefault()}
          onClick={() => bumpFontSize(1)}
          className="w-8 h-8 flex items-center justify-center rounded-md text-sm font-semibold border bg-surface2 border-border text-white hover:border-accent hover:text-accent cursor-pointer font-body"
        >
          A+
        </button>

        <span className="w-px h-6 bg-border mx-1" />

        <select
          onMouseDown={e => e.stopPropagation()}
          onChange={e => run('formatBlock', e.target.value)}
          defaultValue=""
          title="Paragraph style"
          className="input-field text-xs py-1.5 w-28"
        >
          <option value="" disabled>Style…</option>
          <option value="p">Paragraph</option>
          <option value="h2">Heading</option>
          <option value="blockquote">Quote</option>
        </select>
      </div>

      {/* Editable area */}
      <div
        ref={ref}
        contentEditable
        suppressContentEditableWarning
        onInput={handleInput}
        onBlur={handleBlur}
        onKeyUp={syncActiveStates}
        onMouseUp={syncActiveStates}
        data-placeholder={placeholder}
        className="rte-content input-field resize-y text-sm leading-relaxed overflow-y-auto focus:outline-none"
        style={{ minHeight }}
      />
    </div>
  );
}
