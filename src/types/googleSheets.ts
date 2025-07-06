export interface Spreadsheet {
  spreadsheetId: string;
  properties: SpreadsheetProperties;
  sheets: Sheet[];
  spreadsheetUrl: string;
}

export interface SpreadsheetProperties {
  title: string;
  locale: string;
  autoRecalc: string;
  timeZone: string;
  defaultFormat: CellData;
}

export interface Sheet {
  properties: SheetProperties;
  data: GridData[];
}

export interface SheetProperties {
  sheetId: number;
  title: string;
  index: number;
  sheetType: string;
  gridProperties: GridProperties;
}

export interface GridProperties {
  rowCount: number;
  columnCount: number;
  frozenRowCount: number;
  frozenColumnCount: number;
  hideGridlines: boolean;
  rowGroupControlAfter: boolean;
  columnGroupControlAfter: boolean;
}

export interface GridData {
  startRow: number;
  startColumn: number;
  rowData: RowData[];
  columnMetadata: ColumnMetadata[];
}

export interface RowData {
  values: CellData[];
}

export interface CellData {
  userEnteredValue: ExtendedValue;
  effectiveValue: ExtendedValue;
  formattedValue: string;
  userEnteredFormat: CellFormat;
  effectiveFormat: CellFormat;
}

export interface ExtendedValue {
  numberValue: number;
  stringValue: string;
  boolValue: boolean;
  formulaValue: string;
  errorValue: ErrorValue;
}

export interface ErrorValue {
  type: string;
  message: string;
}

export interface ColumnMetadata {
  pixelSize: number;
}

// Define the ConditionalFormatRule type
export interface ConditionalFormatRule {
  ranges?: GridRange[];
  booleanRule?: BooleanRule;
  gradientRule?: GradientRule;
}

export interface BooleanRule {
  condition?: BooleanCondition;
  format?: CellFormat;
}

export interface GradientRule {
  minpoint?: InterpolationPoint;
  midpoint?: InterpolationPoint;
  maxpoint?: InterpolationPoint;
}

export interface BooleanCondition {
  type?: string;
  values?: ConditionValue[];
}

export interface InterpolationPoint {
  color?: Color;
  type?: string;
  value?: string;
}

export interface ConditionValue {
  relativeDate?: string;
  userEnteredValue?: string;
}

export interface CellFormat {
  backgroundColor?: Color;
  textFormat?: TextFormat;
}

export interface TextFormat {
  foregroundColor?: Color;
  bold?: boolean;
  italic?: boolean;
}

export interface Color {
  red?: number;
  green?: number;
  blue?: number;
  alpha?: number;
}

export interface GridRange {
  sheetId?: number;
  startRowIndex?: number;
  endRowIndex?: number;
  startColumnIndex?: number;
  endColumnIndex?: number;
}
