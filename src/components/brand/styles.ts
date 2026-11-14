/**
 * Class strings shared by the Brand Standards' server blocks (./kit.tsx) and
 * its client demos (./demos). No imports, so either side can use them.
 *
 * `[.brand-print_&]:` applies inside the PDF route (src/app/brand/print).
 */

/** The manual's small mono label (the hill pages' eyebrow, a size down). */
export const LABEL = "font-mono text-[12px] leading-4 tracking-[0.1em] uppercase";
export const BODY = "text-[18px] leading-[28px] text-foreground/75 [.brand-print_&]:text-[16px] [.brand-print_&]:leading-[24px]";
export const SMALL = "text-p-sm text-foreground/70";

/** Shown only on the website (interactive controls have no meaning on paper). */
export const WEB_ONLY = "[.brand-print_&]:hidden";
/** Shown only in the PDF. */
export const PRINT_ONLY = "hidden [.brand-print_&]:block";

/** In the PDF, this block takes the page's spare height (its children can then fill it). */
export const PRINT_GROW = "[.brand-print_&]:min-h-0 [.brand-print_&]:flex-1";
/** In the PDF, this block sits at the foot of the page (the padding keeps a gap when the page is full). */
export const PRINT_BOTTOM = "[.brand-print_&]:mt-auto [.brand-print_&]:pt-8";
/** In the PDF, a one-row grid whose row takes the height the grid was given (pair with PRINT_GROW). */
export const PRINT_ROWS_1 = "[.brand-print_&]:grid-rows-[minmax(0,1fr)]";
/** In the PDF, a two-row grid sharing the height equally (pair with PRINT_GROW). */
export const PRINT_ROWS_2 = "[.brand-print_&]:grid-rows-[repeat(2,minmax(0,1fr))]";
/** In the PDF, a column whose PRINT_FILL child takes the spare height (a figure with its caption below). */
export const PRINT_FILL_COL = "[.brand-print_&]:flex [.brand-print_&]:min-h-0 [.brand-print_&]:flex-col";
/** In the PDF, drop the fixed proportion and fill the PRINT_FILL_COL parent. */
export const PRINT_FILL = "[.brand-print_&]:aspect-auto [.brand-print_&]:min-h-0 [.brand-print_&]:flex-1";
