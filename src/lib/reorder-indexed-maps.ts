import { arrayMove } from "@dnd-kit/sortable";

/** Rebuilds index-keyed maps after reordering a parallel array by arrayMove. */
export function reorderIndexMaps(
  maps: Array<Map<number, unknown>>,
  oldIndex: number,
  newIndex: number,
  length: number,
): void {
  for (const map of maps) {
    const values: unknown[] = Array.from({ length }, (_, i) => map.get(i));
    const moved = arrayMove(values, oldIndex, newIndex);
    map.clear();
    moved.forEach((value, index) => {
      if (value !== undefined) {
        map.set(index, value);
      }
    });
  }
}
