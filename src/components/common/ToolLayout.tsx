import Breadcrumb from './Breadcrumb'

interface ToolLayoutProps {
  title: string
  description?: string
  children: React.ReactNode
  category?: {
    name: string
    href: string
  }
}

const ToolLayout: React.FC<ToolLayoutProps> = ({
  title,
  description,
  children,
  category
}) => {
  const breadcrumbItems = [
    { label: '首页', href: '/' },
    ...(category ? [{ label: category.name, href: category.href }] : []),
    { label: title }
  ]

  return (
    <div className="max-w-4xl mx-auto">
      <Breadcrumb items={breadcrumbItems} />
      
      <div className="mt-6">
        <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
        {description && (
          <p className="text-gray-600 mt-2">{description}</p>
        )}
      </div>

      <div className="mt-6">
        {children}
      </div>
    </div>
  )
}

export default ToolLayout
