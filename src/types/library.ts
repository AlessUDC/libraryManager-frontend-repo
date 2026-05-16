export type CopyStatus = 'AVAILABLE' | 'LENT' | 'RESERVED' | 'HELD' | 'MAINTENANCE';

export type CopyCondition = 'NEW' | 'GOOD' | 'DAMAGED' | 'LOST';


export interface Category {
  categoryId: string;
  title: string;
  activeState: boolean;
}

export interface Author {
  authorId: string;
  name: string;
  slug: string;
  nationality?: string;
  biography?: string;
  activeState: boolean;
}

export interface Book {
  bookId: string;
  title: string;
  slug: string;
  isbn?: string;
  publisher?: string;
  publicationYear?: number;
  edition?: string;
  language?: string;
  description?: string;
  activeState: boolean;
  categories?: Category[];
  authors?: Author[];
  totalCopies?: number;
  availableCopies?: number;
  copies?: Copy[];
}

export interface Copy {
  copyId: string;
  barcode: string;
  location?: string;
  status: CopyStatus;
  condition: CopyCondition;
  bookId: string;
  activeState: boolean;
  book?: Book;
}

// DTOs for API requests
export interface CreateCategoryDto {
  title: string;
  activeState?: boolean;
}

export interface UpdateCategoryDto {
  title?: string;
  activeState?: boolean;
}

export interface CreateAuthorDto {
  name: string;
  nationality?: string;
  biography?: string;
  activeState?: boolean;
}

export interface UpdateAuthorDto {
  name?: string;
  nationality?: string;
  biography?: string;
  activeState?: boolean;
}

export interface CreateBookDto {
  title: string;
  isbn?: string;
  publisher?: string;
  publicationYear?: number;
  edition?: string;
  language?: string;
  description?: string;
  activeState?: boolean;
  categoryIds?: string[];
  authorIds?: string[];
}

export interface UpdateBookDto {
  title?: string;
  isbn?: string;
  publisher?: string;
  publicationYear?: number;
  edition?: string;
  language?: string;
  description?: string;
  activeState?: boolean;
  categoryIds?: string[];
  authorIds?: string[];
}


export interface CreateCopyDto {
  barcode: string;
  location?: string;
  status?: CopyStatus;
  condition?: CopyCondition;
  bookId: string;
  activeState?: boolean;
  quantity?: number;
}

export interface UpdateCopyDto {
  barcode?: string;
  location?: string;
  status?: CopyStatus;
  condition?: CopyCondition;
  activeState?: boolean;
}
