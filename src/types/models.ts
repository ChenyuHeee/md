export type NodeType = 'file' | 'folder';

export type ThemeMode = 'light' | 'dark' | 'system';

export interface FileNode {
  id: string;
  name: string;
  type: NodeType;
  parentId: string | null;
  childrenIds: string[];
  createdAt: number;
  updatedAt: number;
}

export interface FileContent {
  fileId: string;
  content: string;
  updatedAt: number;
}

export interface Asset {
  id: string;
  mime: string;
  data: Blob;
  createdAt: number;
}

export interface Settings {
  themeMode: ThemeMode;
  lastOpenFileId?: string;
  ui?: {
    leftWidth?: number;
    centerWidth?: number;
    rightWidth?: number;
  };
}
