import type { TagType } from '@/types'

interface TagProps {
  type: TagType
}

const tagStyles: Record<TagType, string> = {
  vip: 'bg-[#fff2e8] text-[#ff6b35]',
  new: 'bg-[#f6ffed] text-[#52c41a]',
  hot: 'bg-[#fff1f0] text-[#ff4d4f]',
  free: 'bg-[#e6f7ff] text-[#1890ff]',
}

const tagLabels: Record<TagType, string> = {
  vip: '权益卡',
  new: 'new',
  hot: 'hot',
  free: '限免',
}

const Tag: React.FC<TagProps> = ({ type }) => {
  return (
    <span className={`text-[11px] px-1.5 py-0.5 rounded font-medium ${tagStyles[type]}`}>
      {tagLabels[type]}
    </span>
  )
}

export default Tag
