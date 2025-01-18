import { DocumentSnapshot } from "firebase-admin/firestore";
import { Timestamp } from "firebase/firestore";

export interface FetchPageResult<T> {
	/** The fetched data items */
	data: T[];

	/** Total number of items across all pages */
	totalItems: number;

	/** Number of items on the current page */
	count: number;

	/** Current page number (if paginated) */
	page: number;

	/** Total number of pages (if paginated) */
	totalPages: number;

	/** Items per page (if paginated) */
	limit: number;

	/** Indicates whether there is a next page */
	hasNext?: boolean;

	/** Indicates whether there is a previous page */
	hasPrev?: boolean;
}




export interface PaginationOptions {
	/** Current page number (logical pagination, not Firestore-native) */
	page?: number; // Default: 1

	/** Number of documents per page */
	limit?: number; // Default: 10

	/** Cursor-based pagination */
	lastVisible?: DocumentSnapshot; // Used for cursor-based pagination

	/** Sorting options */
	orderBy?: {
		field: string; // Firestore field to sort by
		direction?: 'asc' | 'desc'; // Sort direction
	};

	/** Filters (Firestore supports up to 30 composite filters) */
	filters?: {
		key: string; // Firestore document field
		value: string | number | boolean | Timestamp; // Supported Firestore types
		operator: FirebaseFirestore.WhereFilterOp; // Firestore comparison operator
	}[];

	/** Fetch all records (ignores pagination if true) */
	all?: boolean;

	/** Enable backend authentication checks */
	useBackendAuth?: boolean;
}
