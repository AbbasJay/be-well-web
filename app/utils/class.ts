// Helper to sort class types by label
export function getSortedClassTypes(
  classTypes: ReadonlyArray<{ value: string; label: string }>
) {
  return [...classTypes].sort((a, b) => a.label.localeCompare(b.label));
}
