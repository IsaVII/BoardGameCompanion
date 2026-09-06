import { useState } from 'react';
import { useAppDispatch } from '../../app/hooks';
import { gamesImported } from './collectionSlice';
import { parseBggExport } from '../../lib/bggImport';

export default function ImportDialog({ onDone }) {
  const dispatch = useAppDispatch();
  const [text, setText] = useState('');
  const [preview, setPreview] = useState(null);
  const [error, setError] = useState('');

  const parse = (raw) => {
    setText(raw);
    setError('');
    if (!raw.trim()) return setPreview(null);
    try {
      const games = parseBggExport(raw);
      setPreview(games);
      if (!games.length) setError('No owned games found in that export.');
    } catch {
      setPreview(null);
      setError('Could not parse that file.');
    }
  };

  const onFile = (e) => {
    const file = e.target.files?.[0];
    if (file) file.text().then(parse);
  };

  const confirm = () => {
    if (preview?.length) {
      dispatch(gamesImported(preview));
      onDone(preview.length);
    }
  };

  return (
    <div className="space-y-3">
      <p className="text-sm text-slate-400">
        Export your collection from BoardGameGeek (Collection → Export, CSV or XML)
        and drop the file or paste its contents here. Nothing is uploaded — parsing
        happens in your browser.
      </p>
      <input type="file" accept=".csv,.xml,text/*" onChange={onFile} className="field" />
      <textarea
        className="field font-mono text-xs" rows="5" placeholder="…or paste export contents"
        value={text} onChange={(e) => parse(e.target.value)}
      />
      {error && <p className="text-sm text-rose-300">{error}</p>}
      {preview?.length > 0 && (
        <div className="rounded-xl border border-edge bg-canvas p-3 text-sm">
          <p className="mb-1 font-semibold">{preview.length} games ready to import</p>
          <p className="text-slate-400">
            {preview.slice(0, 6).map((g) => g.title).join(', ')}
            {preview.length > 6 ? '…' : ''}
          </p>
        </div>
      )}
      <button className="btn-primary w-full" disabled={!preview?.length} onClick={confirm}>
        Import {preview?.length || ''} games
      </button>
    </div>
  );
}
