// Where "Back to list" on the details page should go.
// The list sends { listSearch: '?q=char&type=Fire' } when it opens a details page.
// Opened directly (typed URL, bookmark, refresh in a new tab) → no state → back to "/pokemon".
export function getBackToListUrl(state: unknown): string {
  if (typeof state === 'object' && state !== null && 'listSearch' in state && typeof state.listSearch === 'string') {
    return '/pokemon' + state.listSearch
  }
  return '/pokemon'
}
