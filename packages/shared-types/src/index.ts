// ==========================================
// API RESPONSE STANDARDS
// ==========================================
export interface ApiResponse<T = any> {
  success: boolean;
  statusCode: number;
  message: string;
  data: T;
  meta: Record<string, any>;
  pagination: PaginationMeta | null;
  errors: ApiError[];
  timestamp: string;
  requestId: string;
  version: string;
}

export interface PaginationMeta {
  page: number;
  limit: number;
  totalCount: number;
  pageCount: number;
  nextCursor?: string | null;
  previousCursor?: string | null;
  hasMore: boolean;
}

export interface ApiError {
  code: string;
  message: string;
  field?: string;
  details?: any;
}

// ==========================================
// DOMAIN DRIVEN DESIGN CORE
// ==========================================
export interface Entity<TId> {
  readonly id: TId;
  readonly createdAt: Date;
  readonly updatedAt: Date;
}

export interface ValueObject<T> {
  equals(vo?: ValueObject<T>): boolean;
}

export interface DomainEvent {
  readonly eventId: string;
  readonly occurredOn: Date;
  readonly eventName: string;
}

// ==========================================
// BASE DOCUMENT STRUCTURE
// ==========================================
export interface IBaseDocument {
  createdAt: Date;
  updatedAt: Date;
  createdBy?: string;
  updatedBy?: string;
  deletedAt?: Date | null;
  deletedBy?: string;
  version: number;
  organizationId: string;
  metadata?: Record<string, any>;
  audit?: AuditRecord[];
}

export interface AuditRecord {
  actor: string;
  action: string;
  timestamp: Date;
  ipAddress?: string;
  requestId?: string;
  previousState?: any;
  newState?: any;
}
