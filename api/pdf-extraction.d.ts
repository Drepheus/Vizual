declare module 'pdf-extraction' {
  interface PDFData {
    text: string;
    [key: string]: any;
  }

  function pdf(buffer: Buffer): Promise<PDFData>;
  export default pdf;
}
