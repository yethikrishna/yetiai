export interface GoogleSheetsCredentials {
  accessToken: string;
  refreshToken?: string;
  expiresAt?: number;
}

// Core Spreadsheet Types
export interface Spreadsheet {
  spreadsheetId: string;
  properties: SpreadsheetProperties;
  sheets: Sheet[];
  namedRanges?: NamedRange[];
  spreadsheetUrl?: string;
}

export interface SpreadsheetProperties {
  title: string;
  locale?: string;
  timeZone?: string;
  autoRecalc?: string;
  defaultFormat?: CellFormat;
  iterativeCalculationSettings?: IterativeCalculationSettings;
}

export interface IterativeCalculationSettings {
  maxIterations: number;
  convergenceThreshold: number;
}

// Sheet Types
export interface Sheet {
  properties: SheetProperties;
  data?: GridData[];
  merges?: GridRange[];
  conditionalFormats?: ConditionalFormatRule[];
  filterViews?: FilterView[];
  protectedRanges?: ProtectedRange[];
  basicFilter?: BasicFilter;
  charts?: Chart[];
  bandedRanges?: BandedRange[];
}

export interface SheetProperties {
  sheetId: number;
  title: string;
  index: number;
  sheetType?: 'GRID' | 'OBJECT';
  gridProperties?: GridProperties;
  hidden?: boolean;
  tabColor?: Color;
  rightToLeft?: boolean;
}

export interface GridProperties {
  rowCount: number;
  columnCount: number;
  frozenRowCount?: number;
  frozenColumnCount?: number;
  hideGridlines?: boolean;
}

export interface GridData {
  startRow?: number;
  startColumn?: number;
  rowData?: RowData[];
  rowMetadata?: RowMetadata[];
  columnMetadata?: ColumnMetadata[];
}

export interface RowData {
  values?: CellData[];
}

export interface CellData {
  userEnteredValue?: ExtendedValue;
  effectiveValue?: ExtendedValue;
  formattedValue?: string;
  userEnteredFormat?: CellFormat;
  effectiveFormat?: CellFormat;
  hyperlink?: string;
  note?: string;
  textFormatRuns?: TextFormatRun[];
  dataValidation?: DataValidationRule;
}

// Cell Value Types
export interface ExtendedValue {
  numberValue?: number;
  stringValue?: string;
  boolValue?: boolean;
  formulaValue?: string;
  errorValue?: ErrorValue;
}

export interface ErrorValue {
  type: string;
  message: string;
}

// Formatting Types
export interface CellFormat {
  numberFormat?: NumberFormat;
  backgroundColor?: Color;
  borders?: Borders;
  padding?: Padding;
  horizontalAlignment?: 'LEFT' | 'CENTER' | 'RIGHT';
  verticalAlignment?: 'TOP' | 'MIDDLE' | 'BOTTOM';
  wrapStrategy?: 'OVERFLOW_CELL' | 'LEGACY_WRAP' | 'CLIP' | 'WRAP';
  textDirection?: 'LEFT_TO_RIGHT' | 'RIGHT_TO_LEFT';
  textFormat?: TextFormat;
  hyperlinkDisplayType?: string;
}

export interface NumberFormat {
  type: 'TEXT' | 'NUMBER' | 'PERCENT' | 'CURRENCY' | 'DATE' | 'TIME' | 'DATE_TIME' | 'SCIENTIFIC';
  pattern?: string;
}

export interface Color {
  red?: number;
  green?: number;
  blue?: number;
  alpha?: number;
}

export interface Borders {
  top?: Border;
  bottom?: Border;
  left?: Border;
  right?: Border;
}

export interface Border {
  style?: 'NONE' | 'DOTTED' | 'DASHED' | 'SOLID' | 'SOLID_MEDIUM' | 'SOLID_THICK' | 'DOUBLE';
  width?: number;
  color?: Color;
}

export interface Padding {
  top?: number;
  right?: number;
  bottom?: number;
  left?: number;
}

export interface TextFormat {
  foregroundColor?: Color;
  fontFamily?: string;
  fontSize?: number;
  bold?: boolean;
  italic?: boolean;
  strikethrough?: boolean;
  underline?: boolean;
}

export interface TextFormatRun {
  startIndex: number;
  format: TextFormat;
}

// Range Types
export interface GridRange {
  sheetId: number;
  startRowIndex?: number;
  endRowIndex?: number;
  startColumnIndex?: number;
  endColumnIndex?: number;
}

export interface A1Range {
  sheetName?: string;
  startColumnIndex: number;
  startRowIndex: number;
  endColumnIndex?: number;
  endRowIndex?: number;
}

export interface NamedRange {
  namedRangeId: string;
  name: string;
  range: GridRange;
}

// Data Validation
export interface DataValidationRule {
  condition: BooleanCondition;
  inputMessage?: string;
  strict?: boolean;
  showCustomUi?: boolean;
}

export interface BooleanCondition {
  type: 'NUMBER_GREATER' | 'NUMBER_GREATER_THAN_EQ' | 'NUMBER_LESS' | 'NUMBER_LESS_THAN_EQ' | 
        'NUMBER_EQ' | 'NUMBER_NOT_EQ' | 'NUMBER_BETWEEN' | 'NUMBER_NOT_BETWEEN' |
        'TEXT_CONTAINS' | 'TEXT_NOT_CONTAINS' | 'TEXT_STARTS_WITH' | 'TEXT_ENDS_WITH' |
        'TEXT_EQ' | 'TEXT_IS_EMAIL' | 'TEXT_IS_URL' | 'DATE_EQ' | 'DATE_BEFORE' | 
        'DATE_AFTER' | 'DATE_ON_OR_BEFORE' | 'DATE_ON_OR_AFTER' | 'DATE_BETWEEN' | 
        'DATE_NOT_BETWEEN' | 'CUSTOM_FORMULA';
  values?: ConditionValue[];
}

export interface ConditionValue {
  userEnteredValue?: string;
  relativeDate?: 'RELATIVE_DATE_UNSPECIFIED' | 'PAST_YEAR' | 'PAST_MONTH' | 'PAST_WEEK' | 
                  'YESTERDAY' | 'TODAY' | 'TOMORROW';
}

// Filter Types
export interface FilterView {
  filterViewId: number;
  title: string;
  range: GridRange;
  namedRangeId?: string;
  sortSpecs?: SortSpec[];
  criteria?: { [key: string]: FilterCriteria };
}

export interface BasicFilter {
  range: GridRange;
  sortSpecs?: SortSpec[];
  criteria?: { [key: string]: FilterCriteria };
}

export interface FilterCriteria {
  hiddenValues?: string[];
  condition?: BooleanCondition;
}

export interface SortSpec {
  dimensionIndex: number;
  sortOrder?: 'ASCENDING' | 'DESCENDING';
}

// Protected Range
export interface ProtectedRange {
  protectedRangeId?: number;
  range?: GridRange;
  namedRangeId?: string;
  description?: string;
  warningOnly?: boolean;
  requestingUserCanEdit?: boolean;
  editors?: Editors;
}

export interface Editors {
  users?: string[];
  groups?: string[];
  domainUsersCanEdit?: boolean;
}

// Chart Types
export interface Chart {
  chartId: number;
  spec: ChartSpec;
  position: EmbeddedObjectPosition;
}

export interface ChartSpec {
  title?: string;
  altText?: string;
  titleTextFormat?: TextFormat;
  subtitle?: string;
  subtitleTextFormat?: TextFormat;
  fontName?: string;
  maximized?: boolean;
  backgroundColor?: Color;
  // There would be specific chart types here (bar, pie, etc.)
}

export interface EmbeddedObjectPosition {
  sheetId: number;
  overlayPosition?: OverlayPosition;
  newSheet?: boolean;
}

export interface OverlayPosition {
  anchorCell?: GridCoordinate;
  offsetXPixels?: number;
  offsetYPixels?: number;
  widthPixels?: number;
  heightPixels?: number;
}

export interface GridCoordinate {
  sheetId: number;
  rowIndex: number;
  columnIndex: number;
}

// Banded Ranges
export interface BandedRange {
  bandedRangeId?: number;
  range: GridRange;
  rowProperties?: BandingProperties;
  columnProperties?: BandingProperties;
}

export interface BandingProperties {
  headerColor?: Color;
  firstBandColor?: Color;
  secondBandColor?: Color;
  footerColor?: Color;
}

// Metadata
export interface RowMetadata {
  pixelSize?: number;
}

export interface ColumnMetadata {
  pixelSize?: number;
}

// Request and Response Types
export interface GetSpreadsheetRequest {
  includeGridData?: boolean;
  ranges?: string[];
}

export interface GetSpreadsheetResponse {
  spreadsheet: Spreadsheet;
}

export interface UpdateValuesRequest {
  values: any[][];
  range: string;
  majorDimension?: 'ROWS' | 'COLUMNS';
  valueInputOption?: 'RAW' | 'USER_ENTERED';
  includeValuesInResponse?: boolean;
  responseValueRenderOption?: 'FORMATTED_VALUE' | 'UNFORMATTED_VALUE' | 'FORMULA';
  responseDateTimeRenderOption?: 'SERIAL_NUMBER' | 'FORMATTED_STRING';
}

export interface UpdateValuesResponse {
  spreadsheetId: string;
  updatedRange: string;
  updatedRows: number;
  updatedColumns: number;
  updatedCells: number;
  updatedData?: ValueRange;
}

export interface AppendValuesRequest {
  values: any[][];
  range: string;
  majorDimension?: 'ROWS' | 'COLUMNS';
  valueInputOption?: 'RAW' | 'USER_ENTERED';
  insertDataOption?: 'OVERWRITE' | 'INSERT_ROWS';
  includeValuesInResponse?: boolean;
  responseValueRenderOption?: 'FORMATTED_VALUE' | 'UNFORMATTED_VALUE' | 'FORMULA';
  responseDateTimeRenderOption?: 'SERIAL_NUMBER' | 'FORMATTED_STRING';
}

export interface AppendValuesResponse {
  spreadsheetId: string;
  tableRange: string;
  updates: UpdateValuesResponse;
}

export interface ValueRange {
  range: string;
  majorDimension?: 'ROWS' | 'COLUMNS';
  values: any[][];
}

export interface BatchUpdateSpreadsheetRequest {
  requests: Request[];
  includeSpreadsheetInResponse?: boolean;
  responseIncludeGridData?: boolean;
  responseRanges?: string[];
}

export interface Request {
  addSheet?: AddSheetRequest;
  deleteSheet?: DeleteSheetRequest;
  updateSheetProperties?: UpdateSheetPropertiesRequest;
  addChart?: AddChartRequest;
  updateCells?: UpdateCellsRequest;
  // Many other request types would be defined here
}

export interface AddSheetRequest {
  properties: SheetProperties;
}

export interface DeleteSheetRequest {
  sheetId: number;
}

export interface UpdateSheetPropertiesRequest {
  properties: SheetProperties;
  fields: string; // Field mask using dot notation
}

export interface AddChartRequest {
  chart: Chart;
}

export interface UpdateCellsRequest {
  start?: GridCoordinate;
  rows?: RowData[];
  fields: string;
  range?: GridRange;
}

export interface BatchUpdateSpreadsheetResponse {
  spreadsheetId: string;
  replies: Reply[];
  spreadsheet?: Spreadsheet;
}

export interface Reply {
  addSheet?: AddSheetResponse;
  addChart?: AddChartResponse;
  // Responses corresponding to request types
}

export interface AddSheetResponse {
  properties: SheetProperties;
}

export interface AddChartResponse {
  chart: Chart;
}

// Utility Types
export type A1Notation = string; // e.g. "Sheet1!A1:B10"
export type SheetTitle = string;
export type ColumnLetter = string; // e.g. "A", "BC"
export type RowNumber = number;   // 1-based index
export type CellValue = string | number | boolean | null;
