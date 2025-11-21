export type DateType = 'exact' | 'approx_range' | 'broad_period'

export interface Attachment {
  id: string
  fileName: string
  filePath: string
}

export interface Note {
  id: string
  title: string
  body: string
  dateType: DateType
  dateStart?: string
  dateEnd?: string
  rangeMarginDays?: number
  tags: string[]
  attachments: Attachment[]
}
