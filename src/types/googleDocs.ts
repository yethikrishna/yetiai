export interface GoogleDocsCredentials {
  accessToken: string;
  refreshToken?: string;
  expiresAt?: number;
}

// Core Document Types
export interface Document {
  documentId: string;
  title: string;
  body: Body;
  documentStyle?: DocumentStyle;
  namedStyles?: NamedStyles;
  suggestionsViewMode?: string;
  documentLinks?: DocumentLinks;
  revisionId?: string;
  suggestedDocumentStyleChanges?: any;
  suggestedNamedStylesChanges?: any;
}

export interface Body {
  content: StructuralElement[];
}

export interface DocumentStyle {
  background?: Background;
  defaultHeaderId?: string;
  defaultFooterId?: string;
  useCustomHeaderFooterMargins?: boolean;
  marginTop?: Dimension;
  marginBottom?: Dimension;
  marginLeft?: Dimension;
  marginRight?: Dimension;
  pageSize?: Size;
  marginHeader?: Dimension;
  marginFooter?: Dimension;
  useFirstPageHeaderFooter?: boolean;
}

export interface NamedStyles {
  styles: NamedStyle[];
}

export interface NamedStyle {
  namedStyleType: string;
  paragraphStyle?: ParagraphStyle;
  textStyle?: TextStyle;
}

export interface DocumentLinks {
  links: Link[];
}

export interface Link {
  url?: string;
  bookmarkId?: string;
  headingId?: string;
}

// Structural Elements
export interface StructuralElement {
  startIndex?: number;
  endIndex?: number;
  paragraph?: Paragraph;
  table?: Table;
  tableOfContents?: TableOfContents;
  sectionBreak?: SectionBreak;
  horizontalRule?: HorizontalRule;
}

// Paragraph Types
export interface Paragraph {
  elements: ParagraphElement[];
  paragraphStyle?: ParagraphStyle;
  bullet?: Bullet;
  suggestedParagraphStyleChanges?: any;
  suggestedBulletChanges?: any;
  suggestedPositionChanges?: any;
}

export interface ParagraphElement {
  startIndex?: number;
  endIndex?: number;
  textRun?: TextRun;
  inlineObjectElement?: InlineObjectElement;
  horizontalRule?: HorizontalRule;
  footnoteReference?: FootnoteReference;
  pageBreak?: PageBreak;
  equationElement?: EquationElement;
  columnBreak?: ColumnBreak;
  person?: Person;
  richLink?: RichLink;
}

export interface TextRun {
  content: string;
  textStyle?: TextStyle;
  suggestedDeletionIds?: string[];
  suggestedInsertionIds?: string[];
  suggestedTextStyleChanges?: any;
}

export interface InlineObjectElement {
  inlineObjectId: string;
  suggestedDeletionIds?: string[];
  suggestedInsertionIds?: string[];
}

export interface FootnoteReference {
  footnoteId: string;
  footnoteNumber: string;
  suggestedDeletionIds?: string[];
  suggestedInsertionIds?: string[];
  suggestedTextStyleChanges?: any;
}

export interface EquationElement {
  suggestedDeletionIds?: string[];
  suggestedInsertionIds?: string[];
}

export interface Person {
  personId: string;
  suggestedDeletionIds?: string[];
  suggestedInsertionIds?: string[];
}

export interface RichLink {
  richLinkId: string;
  richLinkProperties?: RichLinkProperties;
  suggestedDeletionIds?: string[];
  suggestedInsertionIds?: string[];
}

export interface RichLinkProperties {
  title?: string;
  uri?: string;
}

// Table Types
export interface Table {
  rows: number;
  columns: number;
  tableRows: TableRow[];
  tableStyle?: TableStyle;
  suggestedInsertionIds?: string[];
  suggestedDeletionIds?: string[];
}

export interface TableRow {
  startIndex?: number;
  endIndex?: number;
  tableCells: TableCell[];
  tableRowStyle?: TableRowStyle;
  suggestedInsertionIds?: string[];
  suggestedDeletionIds?: string[];
}

export interface TableCell {
  startIndex?: number;
  endIndex?: number;
  content: StructuralElement[];
  tableCellStyle?: TableCellStyle;
  suggestedInsertionIds?: string[];
  suggestedDeletionIds?: string[];
}

export interface TableStyle {
  tableColumnProperties?: TableColumnProperties[];
}

export interface TableColumnProperties {
  widthType?: string;
  width?: Dimension;
}

export interface TableRowStyle {
  minRowHeight?: Dimension;
}

export interface TableCellStyle {
  rowSpan?: number;
  columnSpan?: number;
  backgroundColor?: Color;
  borderLeft?: Border;
  borderRight?: Border;
  borderTop?: Border;
  borderBottom?: Border;
  paddingLeft?: Dimension;
  paddingRight?: Dimension;
  paddingTop?: Dimension;
  paddingBottom?: Dimension;
  contentAlignment?: string;
}

// Table of Contents
export interface TableOfContents {
  content: StructuralElement[];
}

// Other Structural Elements
export interface SectionBreak {
  sectionStyle?: SectionStyle;
}

export interface SectionStyle {
  sectionType?: string;
  columnProperties?: SectionColumnProperties[];
  contentDirection?: string;
  marginTop?: Dimension;
  marginBottom?: Dimension;
  marginLeft?: Dimension;
  marginRight?: Dimension;
  marginHeader?: Dimension;
  marginFooter?: Dimension;
  evenPageHeaderId?: string;
  oddPageHeaderId?: string;
  evenPageFooterId?: string;
  oddPageFooterId?: string;
  pageSize?: Size;
}

export interface SectionColumnProperties {
  width?: Dimension;
  paddingEnd?: Dimension;
}

export interface HorizontalRule {
  textStyle?: TextStyle;
  suggestedInsertionIds?: string[];
  suggestedDeletionIds?: string[];
  suggestedTextStyleChanges?: any;
}

export interface PageBreak {
  textStyle?: TextStyle;
  suggestedInsertionIds?: string[];
  suggestedDeletionIds?: string[];
}

export interface ColumnBreak {
  textStyle?: TextStyle;
  suggestedInsertionIds?: string[];
  suggestedDeletionIds?: string[];
}

// Style Types
export interface ParagraphStyle {
  namedStyleType?: string;
  alignment?: string;
  lineSpacing?: number;
  direction?: string;
  spacingMode?: string;
  spaceAbove?: Dimension;
  spaceBelow?: Dimension;
  borderBetween?: Border;
  borderTop?: Border;
  borderBottom?: Border;
  borderLeft?: Border;
  borderRight?: Border;
  indentFirstLine?: Dimension;
  indentStart?: Dimension;
  indentEnd?: Dimension;
  keepLinesTogether?: boolean;
  keepWithNext?: boolean;
  avoidWidowAndOrphan?: boolean;
  shading?: Shading;
  tabStops?: TabStop[];
}

export interface TextStyle {
  bold?: boolean;
  italic?: boolean;
  underline?: boolean;
  strikethrough?: boolean;
  smallCaps?: boolean;
  backgroundColor?: Color;
  foregroundColor?: Color;
  fontSize?: Dimension;
  weightedFontFamily?: WeightedFontFamily;
  baselineOffset?: string;
  link?: Link;
  underlineColor?: OptionalColor;
  strikethroughColor?: OptionalColor;
}

export interface WeightedFontFamily {
  fontFamily: string;
  weight: number;
}

export interface Bullet {
  listId: string;
  nestingLevel: number;
  textStyle?: TextStyle;
}

export interface Color {
  color?: {
    rgbColor?: RgbColor;
  };
}

export interface RgbColor {
  red?: number;
  green?: number;
  blue?: number;
}

export interface OptionalColor {
  color?: Color;
}

export interface Background {
  color?: Color;
}

export interface Dimension {
  magnitude: number;
  unit: string;
}

export interface Size {
  width: Dimension;
  height: Dimension;
}

export interface Border {
  color?: Color;
  width?: Dimension;
  padding?: Dimension;
  dashStyle?: string;
}

export interface Shading {
  backgroundColor?: Color;
}

export interface TabStop {
  offset?: Dimension;
  alignment?: string;
}

// Request and Response Types
export interface GetDocumentRequest {
  documentId: string;
  suggestionsViewMode?: string;
}

export interface GetDocumentResponse {
  document: Document;
}

export interface CreateDocumentRequest {
  title: string;
  body?: Body;
  documentStyle?: DocumentStyle;
  suggestionsViewMode?: string;
}

export interface BatchUpdateDocumentRequest {
  requests: Request[];
  writeControl?: WriteControl;
}

export interface BatchUpdateDocumentResponse {
  documentId: string;
  writeControl?: WriteControl;
  replies?: Response[];
}

export interface WriteControl {
  requiredRevisionId?: string;
  targetRevisionId?: string;
}

export interface Request {
  insertText?: InsertTextRequest;
  deleteContentRange?: DeleteContentRangeRequest;
  updateParagraphStyle?: UpdateParagraphStyleRequest;
  updateTextStyle?: UpdateTextStyleRequest;
  insertTableRow?: InsertTableRowRequest;
  insertTableColumn?: InsertTableColumnRequest;
  deleteTableRow?: DeleteTableRowRequest;
  deleteTableColumn?: DeleteTableColumnRequest;
  insertTable?: InsertTableRequest;
  replaceAllText?: ReplaceAllTextRequest;
  createParagraphBullets?: CreateParagraphBulletsRequest;
  insertPageBreak?: InsertPageBreakRequest;
  createHeader?: CreateHeaderRequest;
  createFooter?: CreateFooterRequest;
  updateDocumentStyle?: UpdateDocumentStyleRequest;
}

export interface InsertTextRequest {
  location?: Location;
  text: string;
}

export interface DeleteContentRangeRequest {
  range: Range;
}

export interface UpdateParagraphStyleRequest {
  range: Range;
  paragraphStyle: ParagraphStyle;
  fields: string;
}

export interface UpdateTextStyleRequest {
  range: Range;
  textStyle: TextStyle;
  fields: string;
}

export interface InsertTableRowRequest {
  tableStartLocation: Location;
  insertBelow: boolean;
  rowCount?: number;
}

export interface InsertTableColumnRequest {
  tableStartLocation: Location;
  insertRight: boolean;
  columnCount?: number;
}

export interface DeleteTableRowRequest {
  tableCellLocation: Location;
}

export interface DeleteTableColumnRequest {
  tableCellLocation: Location;
}

export interface InsertTableRequest {
  location: Location;
  rows: number;
  columns: number;
}

export interface ReplaceAllTextRequest {
  containsText: SubstringMatchCriteria;
  replaceText: string;
}

export interface CreateParagraphBulletsRequest {
  range: Range;
  bulletPreset: string;
}

export interface InsertPageBreakRequest {
  location: Location;
}

export interface CreateHeaderRequest {
  type: string;
  sectionBreakLocation?: Location;
}

export interface CreateFooterRequest {
  type: string;
  sectionBreakLocation?: Location;
}

export interface UpdateDocumentStyleRequest {
  documentStyle: DocumentStyle;
  fields: string;
}

export interface SubstringMatchCriteria {
  text: string;
  matchCase?: boolean;
}

export interface Location {
  index: number;
  segmentId?: string;
}

export interface Range {
  startIndex: number;
  endIndex: number;
  segmentId?: string;
}

export interface Response {
  insertText?: InsertTextResponse;
  replaceAllText?: ReplaceAllTextResponse;
  createHeader?: CreateHeaderResponse;
  createFooter?: CreateFooterResponse;
}

export interface InsertTextResponse {
  endIndex: number;
}

export interface ReplaceAllTextResponse {
  occurrencesChanged: number;
}

export interface CreateHeaderResponse {
  headerId: string;
}

export interface CreateFooterResponse {
  footerId: string;
}

// Utility Types
export type DocumentId = string;
export type ParagraphIndex = number;
export type DocumentContent = string;
