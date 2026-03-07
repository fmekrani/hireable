declare module 'pdf-parse' {
  interface PDFInfo {
    PDFFormatVersion?: string
    IsAcroFormPresent?: boolean
    IsXFAPresent?: boolean
    Title?: string
    Author?: string
    Subject?: string
    Creator?: string
    Producer?: string
    CreationDate?: string
    ModDate?: string
    [key: string]: unknown
  }

  interface PDFMetadata {
    _metadata?: unknown
    [key: string]: unknown
  }

  interface PDFData {
    numpages: number
    numrender: number
    info: PDFInfo
    metadata: PDFMetadata | null
    text: string
    version: string
  }

  interface PDFOptions {
    pagerender?: (pageData: unknown) => string
    max?: number
    version?: string
  }

  function pdfParse(dataBuffer: Buffer, options?: PDFOptions): Promise<PDFData>

  export = pdfParse
}
