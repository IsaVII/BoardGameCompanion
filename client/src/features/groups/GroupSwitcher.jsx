import { useAppDispatch, useAppSelector } from '../../app/hooks';
import { selectGroups, selectActiveGroupId, activeGroupSet } from './groupsSlice';

export default function GroupSwitcher() {
  const dispatch = useAppDispatch();
  const groups = useAppSelector(selectGroups);
  const activeId = useAppSelector(selectActiveGroupId);

  if (groups.length <= 1) {
    return <span className="chip">{groups[0]?.name ?? 'My Shelf'}</span>;
  }

  return (
    <select
      className="field w-auto py-1.5 text-sm"
      value={activeId ?? ''}
      onChange={(e) => dispatch(activeGroupSet(e.target.value))}
      aria-label="Active group"
    >
      {groups.map((g) => (
        <option key={g.id} value={g.id}>
          {g.name}
          {g.memberCount > 1 ? ` · ${g.memberCount}` : ''}
        </option>
      ))}
    </select>
  );
}
