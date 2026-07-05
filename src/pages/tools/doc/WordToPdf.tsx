import GenericDocConverter from './GenericDocConverter'

const WordToPdf = () => (
  <GenericDocConverter
    toolId="word-2-pdf"
    acceptTypes=".docx"
    acceptHint="DOCX"
    defaultTargetExt=".pdf"
  />
)
export default WordToPdf
