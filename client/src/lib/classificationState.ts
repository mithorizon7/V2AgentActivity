import { agentProcesses, type AgentProcess, type ClassificationItem } from "@shared/schema";

function sameItem(left: ClassificationItem, right: ClassificationItem) {
  return (
    left.id === right.id &&
    left.text === right.text &&
    left.correctProcess === right.correctProcess &&
    left.category === right.category
  );
}

function sameItemList(left: ClassificationItem[], right: ClassificationItem[]) {
  return (
    left.length === right.length &&
    left.every((item, index) => {
      const other = right[index];
      return other ? sameItem(item, other) : false;
    })
  );
}

export function createEmptyProcessBuckets(): Record<AgentProcess, ClassificationItem[]> {
  return agentProcesses.reduce((accumulator, process) => {
    accumulator[process] = [];
    return accumulator;
  }, {} as Record<AgentProcess, ClassificationItem[]>);
}

export function shuffleItems<T>(items: T[]): T[] {
  const shuffled = [...items];

  for (let index = shuffled.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(Math.random() * (index + 1));
    [shuffled[index], shuffled[swapIndex]] = [shuffled[swapIndex], shuffled[index]];
  }

  return shuffled;
}

type NormalizePlacementOptions = {
  items: ClassificationItem[];
  unsortedItems: ClassificationItem[];
  itemsByProcess: Partial<Record<AgentProcess, ClassificationItem[]>>;
  activeProcesses?: readonly AgentProcess[];
};

export function normalizeClassificationPlacement({
  items,
  unsortedItems,
  itemsByProcess,
  activeProcesses = agentProcesses,
}: NormalizePlacementOptions) {
  const itemById = new Map(items.map((item) => [item.id, item]));
  const allowedProcesses = new Set(activeProcesses);
  const normalizedByProcess = createEmptyProcessBuckets();
  const assignedIds = new Set<string>();
  const inactiveCandidates: ClassificationItem[] = [];

  for (const process of agentProcesses) {
    const processItems = itemsByProcess[process] ?? [];

    for (const item of processItems) {
      const canonicalItem = itemById.get(item.id);
      if (!canonicalItem || assignedIds.has(canonicalItem.id)) {
        continue;
      }

      if (allowedProcesses.has(process)) {
        normalizedByProcess[process].push(canonicalItem);
        assignedIds.add(canonicalItem.id);
      } else {
        inactiveCandidates.push(canonicalItem);
      }
    }
  }

  const normalizedUnsorted: ClassificationItem[] = [];
  const seenUnsortedIds = new Set<string>();
  const unsortedCandidates = [...unsortedItems, ...inactiveCandidates, ...items];

  for (const item of unsortedCandidates) {
    const canonicalItem = itemById.get(item.id);
    if (!canonicalItem) {
      continue;
    }
    if (assignedIds.has(canonicalItem.id) || seenUnsortedIds.has(canonicalItem.id)) {
      continue;
    }

    normalizedUnsorted.push(canonicalItem);
    seenUnsortedIds.add(canonicalItem.id);
  }

  const didChange =
    !sameItemList(unsortedItems, normalizedUnsorted) ||
    agentProcesses.some((process) => !sameItemList(itemsByProcess[process] ?? [], normalizedByProcess[process]));

  return {
    unsortedItems: normalizedUnsorted,
    itemsByProcess: normalizedByProcess,
    didChange,
  };
}

export function pruneItemRecord<T>(
  record: Record<string, T>,
  items: ClassificationItem[],
): Record<string, T> {
  const validIds = new Set(items.map((item) => item.id));
  let changed = false;

  const nextRecord = Object.fromEntries(
    Object.entries(record).filter(([itemId]) => {
      const keep = validIds.has(itemId);
      if (!keep) {
        changed = true;
      }
      return keep;
    }),
  ) as Record<string, T>;

  return changed ? nextRecord : record;
}
