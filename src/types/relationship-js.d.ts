declare module 'relationship.js' {
  export interface RelationshipOptions {
    text?: string
    target?: string
    sex?: 0 | 1 | -1
    type?: 'default' | 'chain' | 'pair'
    reverse?: boolean
    mode?: string
    optimal?: boolean
  }

  export default function relationship(options?: RelationshipOptions | string): string[]
}

