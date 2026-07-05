import GenericDocConverter from './GenericDocConverter'

const ExcelConvert = () => (
  <GenericDocConverter
    toolId="excel-convert"
    acceptTypes=".xls,.xlsx"
    acceptHint="XLS, XLSX"
    targetFormats={['pdf', 'png', 'html']}
  />
)
export default ExcelConvert
