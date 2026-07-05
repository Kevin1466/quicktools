import GenericDocConverter from './GenericDocConverter'

const ExcelToPdf = () => (
  <GenericDocConverter
    toolId="excel-to-pdf"
    acceptTypes=".xls,.xlsx"
    acceptHint="XLS, XLSX"
    defaultTargetExt=".pdf"
  />
)
export default ExcelToPdf
