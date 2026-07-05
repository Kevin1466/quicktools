import GenericDocConverter from './GenericDocConverter'

const PptConvert = () => (
  <GenericDocConverter
    toolId="ppt-convert"
    acceptTypes=".pptx"
    acceptHint="PPTX"
    targetFormats={['pdf', 'png', 'html']}
  />
)
export default PptConvert
