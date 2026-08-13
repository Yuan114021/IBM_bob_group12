import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useFontSize, SIZES } from '../context/FontSizeContext'

export default function FontSizePage() {
  const { fontSize, setFontSize } = useFontSize()
  const navigate = useNavigate()
  const [preview, setPreview] = useState(fontSize)

  const handleConfirm = () => {
    setFontSize(preview)
    navigate(-1)
  }

  return (
    <div className="page-content">
      <div className="app-header" style={{ justifyContent: 'flex-start', padding: '0 16px', gap: 12 }}>
        <button onClick={() => navigate(-1)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--primary)', fontSize: 18 }}>
          <i className="fa-solid fa-arrow-left"></i>
        </button>
        <h2><i className="fa-solid fa-text-height"></i>字體大小設定</h2>
      </div>

      <div style={{ padding: '24px 20px', display: 'flex', flexDirection: 'column', gap: 20 }}>

        {/* 滑桿控制 */}
        <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--r-md)', padding: '20px 20px 16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 18 }}>
            <label style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-sub)', whiteSpace: 'nowrap', minWidth: 60 }}>字體大小</label>
            <input
              type="range"
              min={10} max={36} step={1}
              value={preview}
              onChange={e => setPreview(parseInt(e.target.value))}
              style={{ flex: 1, accentColor: 'var(--primary)', height: 6, cursor: 'pointer' }}
            />
            <span style={{ minWidth: 52, textAlign: 'right', fontSize: 16, fontWeight: 700, color: 'var(--primary)' }}>
              {preview} px
            </span>
          </div>

          {/* 快捷按鈕 */}
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
            <span style={{ fontSize: 12, color: 'var(--text-sub)', marginRight: 2 }}>快速選擇：</span>
            {SIZES.map(s => (
              <button
                key={s.px}
                onClick={() => setPreview(s.px)}
                style={{
                  border: `1.5px solid ${preview === s.px ? 'var(--primary)' : 'var(--border)'}`,
                  background: preview === s.px ? 'var(--primary)' : 'var(--bg)',
                  color: preview === s.px ? '#fff' : 'var(--text-sub)',
                  fontSize: 13, fontWeight: 600,
                  padding: '5px 14px', borderRadius: 9999,
                  cursor: 'pointer', transition: 'all .15s',
                  fontFamily: 'inherit',
                }}
              >
                {s.label}（{s.px}px）
              </button>
            ))}
          </div>
        </div>

        {/* 預覽區 */}
        <div>
          <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-sub)', textTransform: 'uppercase', letterSpacing: '.06em', marginBottom: 8 }}>
            預覽效果
          </div>
          <div style={{
            background: 'var(--surface)', border: '1px solid var(--border)',
            borderRadius: 'var(--r-md)', padding: 24,
            fontSize: preview, lineHeight: 1.75,
            color: 'var(--text)', transition: 'font-size .12s ease',
            minHeight: 140,
          }}>
            <p>社區共享平台，讓資源流通，互助從這裡開始。</p>
            <p style={{ marginTop: '0.8em' }}>鄰近好友正在分享：有機蔬菜、二手衣物、舊家電。</p>
            <p style={{ marginTop: '0.8em' }}>The quick brown fox jumps over the lazy dog. 1234567890</p>
          </div>
        </div>

        {/* 目前設定提示 */}
        {preview !== fontSize && (
          <div style={{ background: 'var(--accent-light)', borderRadius: 'var(--r-md)', padding: '10px 14px', fontSize: 13, color: '#7a5c00' }}>
            <i className="fa-solid fa-circle-info" style={{ marginRight: 6 }}></i>
            按下「套用」後全站字體將更新為 <strong>{preview}px</strong>
          </div>
        )}

        {/* 套用按鈕 */}
        <button
          className="btn btn-primary"
          onClick={handleConfirm}
          style={{ marginTop: 4 }}
        >
          <i className="fa-solid fa-check" style={{ marginRight: 8 }}></i>
          套用並返回
        </button>

        {/* 重設 */}
        <button
          onClick={() => setPreview(16)}
          style={{ background: 'none', border: 'none', color: 'var(--text-sub)', fontSize: 14, cursor: 'pointer', fontFamily: 'inherit', textDecoration: 'underline' }}
        >
          重設為預設值（16px）
        </button>
      </div>
    </div>
  )
}
