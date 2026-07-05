import { Routes, Route } from 'react-router-dom'
import Layout from './components/layout/Layout'
import HomePage from './pages/home/HomePage'
import CategoryPage from './pages/category/CategoryPage'
import SearchPage from './pages/search/SearchPage'
import ImageCompress from './pages/tools/img/ImageCompress'
import PdfToWord from './pages/tools/pdf/PdfToWord'
import PdfWatermark from './pages/tools/pdf/PdfWatermark'
import GarbageSort from './pages/tools/life/GarbageSort'
import ChineseConverter from './pages/tools/text/ChineseConverter'
import MarsTranslator from './pages/tools/text/MarsTranslator'
import TextUnique from './pages/tools/text/TextUnique'
import TextSecretMsg from './pages/tools/text/TextSecretMsg'
import TextDiff from './pages/tools/text/TextDiff'
import TextToPinyin from './pages/tools/text/TextToPinyin'
import TextToSpeech from './pages/tools/text/TextToSpeech'
import Base64Tool from './pages/tools/develop/Base64Tool'
import UrlEncodeTool from './pages/tools/develop/UrlEncodeTool'
import UnicodeTool from './pages/tools/develop/UnicodeTool'
import UuidTool from './pages/tools/develop/UuidTool'
import UserAgentTool from './pages/tools/develop/UserAgentTool'
import JsonCheckTool from './pages/tools/develop/JsonCheckTool'
import JsonBeautifyTool from './pages/tools/develop/JsonBeautifyTool'
import UrlParseTool from './pages/tools/develop/UrlParseTool'
import TemperatureConvert from './pages/tools/data/TemperatureConvert'
import LengthConvert from './pages/tools/data/LengthConvert'
import ByteCal from './pages/tools/data/ByteCal'
import Num2Zh from './pages/tools/data/Num2Zh'
import BMICalculator from './pages/tools/data/BMICalculator'
import DateCalculator from './pages/tools/data/DateCalculator'
import CalculatorTool from './pages/tools/data/CalculatorTool'
import PartitionTool from './pages/tools/data/PartitionTool'
import HexConvert from './pages/tools/data/HexConvert'
import TimestampConvert from './pages/tools/data/TimestampConvert'
import SocialInsuranceCalculator from './pages/tools/data/SocialInsuranceCalculator'
import MortgageCalculator from './pages/tools/data/MortgageCalculator'
import InvestCalculator from './pages/tools/data/InvestCalculator'
import ImgConvert from './pages/tools/img/ImgConvert'
import ImgEnlarge from './pages/tools/img/ImgEnlarge'
import ImgFade from './pages/tools/img/ImgFade'
import ImgPixel from './pages/tools/img/ImgPixel'
import Img9Grid from './pages/tools/img/Img9Grid'
import QrcodeScan from './pages/tools/img/QrcodeScan'
import QrcodeGen from './pages/tools/img/QrcodeGen'
import PrettifyQrcode from './pages/tools/img/PrettifyQrcode'
import VisitCard from './pages/tools/img/VisitCard'
import Biaoqing from './pages/tools/img/Biaoqing'
import GifSplitter from './pages/tools/img/GifSplitter'
import GifCreate from './pages/tools/img/GifCreate'
import ImgEditCanvas from './pages/tools/img/ImgEditCanvas'
import AvatarPendant from './pages/tools/img/AvatarPendant'
import QbtoolLicense from './pages/tools/img/QbtoolLicense'
import ImageSecretMsg from './pages/tools/img/ImageSecretMsg'
import ImgToText from './pages/tools/img/ImgToText'
import ImgWatermarkRemove from './pages/tools/img/ImgWatermarkRemove'
import IdPhoto from './pages/tools/img/IdPhoto'
import Identification from './pages/tools/img/Identification'
import InvoiceExtract from './pages/tools/img/InvoiceExtract'
import RegexpTool from './pages/tools/develop/RegexpTool'
import ColorTransTool from './pages/tools/develop/ColorTransTool'
import PasswordGenerator from './pages/tools/develop/PasswordGenerator'
import Md5Tool from './pages/tools/develop/Md5Tool'
import CryptoTool from './pages/tools/develop/CryptoTool'
import MarkdownTool from './pages/tools/develop/MarkdownTool'
import YamlJsonTool from './pages/tools/develop/YamlJsonTool'
import JsonDiffTool from './pages/tools/develop/JsonDiffTool'
import PasswordCheckTool from './pages/tools/develop/PasswordCheckTool'
import CompilationTool from './pages/tools/develop/CompilationTool'
import WordCount from './pages/tools/education/WordCount'
import PeriodicTable from './pages/tools/education/PeriodicTable'
import DynastiesTool from './pages/tools/education/DynastiesTool'
import CapitalTool from './pages/tools/education/CapitalTool'
import AllegoryTool from './pages/tools/education/AllegoryTool'
import IdiomJielongTool from './pages/tools/education/IdiomJielongTool'
import ZitieTool from './pages/tools/education/ZitieTool'
import SchoolTool from './pages/tools/education/SchoolTool'
import RadicalTool from './pages/tools/education/RadicalTool'
import ExplainTool from './pages/tools/education/ExplainTool'
import ChengyuDaquanTool from './pages/tools/education/ChengyuDaquanTool'
import MarkmapTool from './pages/tools/education/MarkmapTool'
import RelativesNameTool from './pages/tools/education/RelativesNameTool'
import HanziFayinTool from './pages/tools/education/HanziFayinTool'
import HandwritingErasure from './pages/tools/education/HandwritingErasure'
import TranslateTool from './pages/tools/education/TranslateTool'
import WhatToEat from './pages/tools/life/WhatToEat'
import RandomTool from './pages/tools/life/RandomTool'
import LedTool from './pages/tools/life/LedTool'
import EmojiTool from './pages/tools/life/EmojiTool'
import ShelfLifeTool from './pages/tools/life/ShelfLifeTool'
import BloodTypeTool from './pages/tools/life/BloodTypeTool'
import CarNumberTool from './pages/tools/life/CarNumberTool'
import WorldTimeTool from './pages/tools/life/WorldTimeTool'
import NumberAcquisitionTool from './pages/tools/life/NumberAcquisitionTool'
import NickTool from './pages/tools/life/NickTool'
import FakeWordTool from './pages/tools/life/FakeWordTool'
import StartupNameTool from './pages/tools/life/StartupNameTool'
import ContractComparisonTool from './pages/tools/life/ContractComparisonTool'
import ZipCodeTool from './pages/tools/life/ZipCodeTool'
import PhoneNumberTool from './pages/tools/life/PhoneNumberTool'
import IPLocationTool from './pages/tools/life/IPLocationTool'
import MakeNameTool from './pages/tools/life/MakeNameTool'
import HospitalRecommendTool from './pages/tools/life/HospitalRecommendTool'
import NamingTool from './pages/tools/life/NamingTool'
import CaloriesListTool from './pages/tools/life/CaloriesListTool'
import KuaidiTool from './pages/tools/life/KuaidiTool'
import ScreenRecord from './pages/tools/video/ScreenRecord'
import VideoToGif from './pages/tools/video/VideoToGif'
import ImgToPdf from './pages/tools/pdf/ImgToPdf'
import PdfMerge from './pages/tools/pdf/PdfMerge'
import PdfSplit from './pages/tools/pdf/PdfSplit'
import PdfPageNumber from './pages/tools/pdf/PdfPageNumber'
import PdfMetadata from './pages/tools/pdf/PdfMetadata'
import PdfPageManage from './pages/tools/pdf/PdfPageManage'
import PdfToPng from './pages/tools/pdf/PdfToPng'
import PdfImagefy from './pages/tools/pdf/PdfImagefy'
import PdfCompress from './pages/tools/pdf/PdfCompress'
import PdfCrop from './pages/tools/pdf/PdfCrop'
import PdfSign from './pages/tools/pdf/PdfSign'
import PdfPageSize from './pages/tools/pdf/PdfPageSize'
import PdfImgExtract from './pages/tools/pdf/PdfImgExtract'
import PdfSearch from './pages/tools/pdf/PdfSearch'
import PdfToExcel from './pages/tools/pdf/PdfToExcel'
import PdfToPpt from './pages/tools/pdf/PdfToPpt'
import PdfToHtml from './pages/tools/pdf/PdfToHtml'
import PdfPassword from './pages/tools/pdf/PdfPassword'
import WordToPdf from './pages/tools/doc/WordToPdf'
import WordConvert from './pages/tools/doc/WordConvert'
import PptConvert from './pages/tools/doc/PptConvert'
import ExcelToPdf from './pages/tools/doc/ExcelToPdf'
import OfficeReduce from './pages/tools/doc/OfficeReduce'
import PptToPdf from './pages/tools/doc/PptToPdf'
import ExcelConvert from './pages/tools/doc/ExcelConvert'
import TableRecognize from './pages/tools/doc/TableRecognize'
import WordScan from './pages/tools/doc/WordScan'
import FileScanTool from './pages/tools/develop/FileScanTool'
import AppInspectorTool from './pages/tools/develop/AppInspectorTool'
import GenericToolPage from './pages/tools/GenericToolPage'
import { AIConfigProvider, useAIConfigContext } from './contexts/AIConfigContext'
import AIConfigModal from './components/common/AIConfigModal'
import { FeedbackProvider, useFeedbackContext } from './contexts/FeedbackContext'
import FeedbackModal from './components/common/FeedbackModal'
import { ExchangeProvider, useExchangeContext } from './contexts/ExchangeContext'
import ExchangeModal from './components/common/ExchangeModal'
import UmamiRouteTracker from './components/common/UmamiRouteTracker'
import { tools } from './data/toolsFromJson'

const toolComponents: Record<string, React.ComponentType> = {
  'image-compress': ImageCompress,
  'pdf-to-word': PdfToWord,
  'pdf-watermark': PdfWatermark,
  'garbage-sort': GarbageSort,
  'chinese': ChineseConverter,
  'toMars': MarsTranslator,
  'unique': TextUnique,
  'text-secret-msg': TextSecretMsg,
  'textdiff': TextDiff,
  'tta': TextToPinyin,
  'tts': TextToSpeech,
  'base64': Base64Tool,
  'urlencode': UrlEncodeTool,
  'unicode': UnicodeTool,
  'uuid': UuidTool,
  'useragent': UserAgentTool,
  'jsoncheck': JsonCheckTool,
  'jsonbeautify': JsonBeautifyTool,
  'urlparse': UrlParseTool,
  'hexconvert': HexConvert,
  'timestamp': TimestampConvert,
  'temperaturetrans': TemperatureConvert,
  'lengthconvert': LengthConvert,
  'byte-cal': ByteCal,
  'num2zh': Num2Zh,
  'bmi': BMICalculator,
  'datecal': DateCalculator,
  'calculator': CalculatorTool,
  'partition': PartitionTool,
  'wuxianyijin': SocialInsuranceCalculator,
  'mortgage': MortgageCalculator,
  'invest': InvestCalculator,
  'imgconvert': ImgConvert,
  'img-enlarge': ImgEnlarge,
  'img-fade': ImgFade,
  'img-pixel': ImgPixel,
  'img9grid': Img9Grid,
  'qrcode-scan': QrcodeScan,
  'qrcode': QrcodeGen,
  'prettify-qrcode': PrettifyQrcode,
  'visit-card': VisitCard,
  'biaoqing': Biaoqing,
  'gifsplitter': GifSplitter,
  'gifcreate': GifCreate,
  'img-edit-canvas': ImgEditCanvas,
  'img-watermark-remove': ImgWatermarkRemove,
  'avatar-pendant': AvatarPendant,
  'qbtool-license': QbtoolLicense,
  'image-secret-msg': ImageSecretMsg,
  'img-2-text': ImgToText,
  'identification': Identification,
  'invoice-extract': InvoiceExtract,
  'id-photo': IdPhoto,
  'regexp': RegexpTool,
  'colortrans': ColorTransTool,
  'pwdgenerator': PasswordGenerator,
  'md5': Md5Tool,
  'crypto': CryptoTool,
  'markdown': MarkdownTool,
  'yaml-2-json': YamlJsonTool,
  'jsondiff': JsonDiffTool,
  'password-check': PasswordCheckTool,
  'compilation': CompilationTool,
  'wordcount': WordCount,
  'periodic': PeriodicTable,
  'dynasties': DynastiesTool,
  'capital': CapitalTool,
  'allegory': AllegoryTool,
  'jielong': IdiomJielongTool,
  'zitie-new': ZitieTool,
  'school': SchoolTool,
  'radical': RadicalTool,
  'explain': ExplainTool,
  'chengyujielong': ChengyuDaquanTool,
  'markmap': MarkmapTool,
  'relatives-name': RelativesNameTool,
  'hanzifayin': HanziFayinTool,
  'handwriting-erasure': HandwritingErasure,
  'translate': TranslateTool,
  'whattoeat': WhatToEat,
  'random': RandomTool,
  'led': LedTool,
  'emoji': EmojiTool,
  'shelflife': ShelfLifeTool,
  'bloodtype': BloodTypeTool,
  'carnumber': CarNumberTool,
  'timer': WorldTimeTool,
  'number-acquisition': NumberAcquisitionTool,
  'nick': NickTool,
  'fakeword': FakeWordTool,
  'startupname': StartupNameTool,
  'contract-comparison': ContractComparisonTool,
  'zipcode': ZipCodeTool,
  'phonenumber': PhoneNumberTool,
  'iplocation': IPLocationTool,
  'makename': MakeNameTool,
  'hospitalrecommend': HospitalRecommendTool,
  'naming': NamingTool,
  'calories_list': CaloriesListTool,
  'kuaidi': KuaidiTool,
  'screen-record': ScreenRecord,
  'video-2-gif': VideoToGif,
  'img-2-pdf-convert': ImgToPdf,
  'pdf-merge': PdfMerge,
  'pdf-split': PdfSplit,
  'pdf-page-number': PdfPageNumber,
  'pdf-metadata': PdfMetadata,
  'pdf-page-manage': PdfPageManage,
  'pdf-2-png': PdfToPng,
  'pdf-imagefy': PdfImagefy,
  'pdf-compress': PdfCompress,
  'pdf-crop': PdfCrop,
  'pdf-sign': PdfSign,
  'pdf-pagesize': PdfPageSize,
  'pdf-img-extract': PdfImgExtract,
  'pdf-search': PdfSearch,
  'pdf-2-excel': PdfToExcel,
  'pdf-2-ppt': PdfToPpt,
  'pdf-2-html': PdfToHtml,
  'pdf-password': PdfPassword,
  'word-2-pdf': WordToPdf,
  'word-convert': WordConvert,
  'ppt-convert': PptConvert,
  'excel-to-pdf': ExcelToPdf,
  'office-reduce': OfficeReduce,
  'ppt-2-pdf': PptToPdf,
  'excel-convert': ExcelConvert,
  'table-recognize': TableRecognize,
  'word-scan': WordScan,
  'file-scan': FileScanTool,
  'app-inspector': AppInspectorTool,
}

const ToolPage = ({ toolId }: { toolId: string }) => {
  const tool = tools.find(t => t.id === toolId)
  if (!tool) {
    return <div className="p-8 text-center">工具不存在</div>
  }
  
  const Component = toolComponents[toolId]
  if (Component) {
    return <Component />
  }

  return <GenericToolPage tool={tool} />
}

function AppContent() {
  const { isModalOpen, closeModal } = useAIConfigContext()
  const { isOpen: isFeedbackOpen, closeFeedback } = useFeedbackContext()
  const { isOpen: isExchangeOpen, closeExchange } = useExchangeContext()
  
  return (
    <Layout>
      <UmamiRouteTracker />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/category/:categoryId" element={<CategoryPage />} />
        <Route path="/search" element={<SearchPage />} />
        {tools.map((tool) => (
          <Route
            key={tool.id}
            path={`/tool/${tool.id}`}
            element={<ToolPage toolId={tool.id} />}
          />
        ))}
        <Route
          path="*"
          element={
            <div className="flex flex-col items-center justify-center min-h-[60vh]">
              <h1 className="text-4xl font-bold text-gray-800 mb-4">404</h1>
              <p className="text-gray-600 mb-8">页面不存在</p>
              <a
                href="/"
                className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition"
              >
                返回首页
              </a>
            </div>
          }
        />
      </Routes>
      <AIConfigModal isOpen={isModalOpen} onClose={closeModal} />
      <FeedbackModal isOpen={isFeedbackOpen} onClose={closeFeedback} />
      <ExchangeModal isOpen={isExchangeOpen} onClose={closeExchange} />
    </Layout>
  )
}

function App() {
  return (
    <AIConfigProvider>
      <FeedbackProvider>
        <ExchangeProvider>
          <AppContent />
        </ExchangeProvider>
      </FeedbackProvider>
    </AIConfigProvider>
  )
}

export default App
