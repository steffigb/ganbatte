export interface Timestamps {
  createdAt: string;
  updatedAt: string;
}

export interface SoftDeletable {
  deletedAt?: string;
}

export interface UserOwned {
  userId: string;
}
