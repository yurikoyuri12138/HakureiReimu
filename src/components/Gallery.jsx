import { Fragment } from 'react'
import { Divider } from 'antd'
import SectionBlock from './SectionBlock.jsx'

// 分栏画廊容器：预热棒 / 正式棒 / 特典棒 / SP棒 / 替补棒（antd Divider 分隔）
export default function Gallery({ sections, info, texts, paused, onOpen }) {
  const shown = sections.filter((sec) => sec.items.length > 0)
  return (
    <>
      {shown.map((sec, i) => (
        <Fragment key={sec.key}>
          {i > 0 && <Divider style={{ margin: '30px auto 2px', maxWidth: 1360 }} />}
          <SectionBlock sec={sec} info={info} texts={texts} paused={paused} onOpen={onOpen} />
        </Fragment>
      ))}
    </>
  )
}
