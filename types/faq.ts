export enum FaqCategory {
  All = 'All',
  General = 'General'
}

export interface Faq {
  type: string
  new?: boolean
  link?: string
  link2?: string
  category: FaqCategory[]
}
