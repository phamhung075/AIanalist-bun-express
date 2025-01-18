import {
    DocumentSnapshot,
    FieldPath,
    OrderByDirection,
    WhereFilterOp
} from "firebase-admin/firestore";

export interface FilterCondition {
    key: string | FieldPath;
    operator: WhereFilterOp;
    value: any;
}

export interface OrderByOption {
    field: string | FieldPath;
    direction?: OrderByDirection;
}

export interface PaginatedResult<T> {
    data: T[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
    lastVisible?: DocumentSnapshot;
    executionTime?: number;
    appliedFilters?: {
        filters?: Record<string, any>;
        dateRange?: {
            field: string;
            start?: Date;
            end?: Date;
        };
        orderBy?: Record<string, OrderByDirection>;
    };
}


// Redis cache implementation helper
export interface RedisCacheOptions {
    /** Redis key prefix */
    keyPrefix?: string;

    /** Default TTL in seconds */
    defaultTTL?: number;

    /** Whether to compress data */
    compress?: boolean;

    /** Cache tags for invalidation */
    tags?: string[];
}


export interface PaginationOptions {
    page?: number;
    limit?: number;
    filters?: FilterCondition[];
    compositeFilters?: {
        type: 'and' | 'or';
        conditions: FilterCondition[];
    }[];
    lastVisible?: DocumentSnapshot;
    orderBy?: OrderByOption | OrderByOption[];
    select?: Array<string | FieldPath>;
    dateRange?: {
        field: string | FieldPath;
        start?: Date;
        end?: Date;
    };
    includeSoftDeleted?: boolean;
    all?: boolean;
}
