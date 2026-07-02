import { Link } from 'react-router-dom';
import { useIsEditor } from './useIsEditor';

/** Renders a link to deck management — only for members of the editors group. */
export function EditorLink() {
  const { isEditor } = useIsEditor();
  if (!isEditor) return null;
  return (
    <Link to="/admin/decks" className="sp-kicker" data-testid="manage-link">
      Manage decks →
    </Link>
  );
}
