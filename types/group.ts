export interface Group {
  id: number;
  name: string;
  description?: string;
  isAdmin: boolean;
  createdAt?: string;
  memberCount?: number;
}

export interface GroupState {
  activeGroup: Group | null;
  availableGroups: Group[];
  isLoadingGroups: boolean;
}

export interface GroupContextData extends GroupState {
  selectGroup: (group: Group) => Promise<void>;
  clearGroup: () => Promise<void>;
  refreshGroups: () => Promise<void>;
  hasGroups: boolean;
}
