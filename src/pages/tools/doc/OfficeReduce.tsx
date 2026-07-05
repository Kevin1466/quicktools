import GenericDocConverter from './GenericDocConverter'

const OfficeReduce = () => (
  <GenericDocConverter
    toolId="office-reduce"
    acceptTypes=".doc,.docx,.ppt,.pptx,.pdf"
    acceptHint="Word, PPT, PDF"
    defaultTargetExt=""
  />
)
export default OfficeReduce
