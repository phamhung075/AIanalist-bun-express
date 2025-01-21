import { validateDTO } from ".";
import { PaginationSchema } from "./Pagination.validation";

export const validatePaginationDTO = validateDTO(PaginationSchema, 'query');
