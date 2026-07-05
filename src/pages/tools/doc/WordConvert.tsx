import GenericDocConverter from './GenericDocConverter'

const WordConvert = () => (
  <GenericDocConverter
    toolId="word-convert"
    acceptTypes=".docx"
    acceptHint="DOCX"
    targetFormats={['pdf', 'png', 'html']}
  />
)
export default WordConvert
