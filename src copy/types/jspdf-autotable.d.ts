declare module 'jspdf-autotable' {
  import { jsPDF } from 'jspdf';
  
  interface UserOptions {
    head?: any[][];
    body?: any[][];
    foot?: any[][];
    startY?: number;
    margin?: Margin;
    pageBreak?: 'auto' | 'avoid' | 'always';
    rowPageBreak?: 'auto' | 'avoid' | 'always';
    showHead?: 'everyPage' | 'firstPage' | 'never';
    showFoot?: 'everyPage' | 'lastPage' | 'never';
    theme?: 'striped' | 'grid' | 'plain';
    styles?: Styles;
    headStyles?: Styles;
    bodyStyles?: Styles;
    footStyles?: Styles;
    alternateRowStyles?: Styles;
    columnStyles?: {
      [key: number]: Styles;
    };
  }

  interface Styles {
    font?: string;
    fontStyle?: string;
    fontSize?: number;
    textColor?: number | [number, number, number];
    fillColor?: number | [number, number, number];
    lineColor?: number | [number, number, number];
    lineWidth?: number;
    cellPadding?: number;
    cellWidth?: 'auto' | 'wrap' | number;
    minCellHeight?: number;
    halign?: 'left' | 'center' | 'right';
    valign?: 'top' | 'middle' | 'bottom';
  }

  interface Margin {
    top?: number;
    right?: number;
    bottom?: number;
    left?: number;
  }

  function autoTable(doc: jsPDF, options: UserOptions): void;
  export default autoTable;
}
