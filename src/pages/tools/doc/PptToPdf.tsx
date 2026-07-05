import GenericDocConverter from './GenericDocConverter'

const PptToPdf = () => (
  <GenericDocConverter
    toolId="ppt-2-pdf"
    acceptTypes=".pptx"
    acceptHint="PPTX"
    defaultTargetExt=".pdf"
  />
)
export default PptToPdf
