import React, { useState, useEffect } from 'react';
import { useCanvasStore } from '../store/canvas';

export const DraftPanel: React.FC = () => {
  const {
    drafts,
    draftPanelOpen,
    saveDraft,
    loadDraft,
    deleteDraft,
    loadDrafts,
    toggleDraftPanel,
    setCompareDraft,
    toggleComparePanel,
  } = useCanvasStore();
  const [draftName, setDraftName] = useState('');
  const [showSaveInput, setShowSaveInput] = useState(false);

  useEffect(() => {
    loadDrafts();
  }, [loadDrafts]);

  const handleSaveDraft = () => {
    saveDraft(draftName.trim());
    setDraftName('');
    setShowSaveInput(false);
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleString();
  };

  if (!draftPanelOpen) return null;

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(0, 0, 0, 0.5)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
    }} onClick={toggleDraftPanel}>
      <div style={{
        width: '600px',
        maxHeight: '80vh',
        background: '#263238',
        color: '#fff',
        borderRadius: '8px',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
      }} onClick={(e) => e.stopPropagation()}>
        <div style={{
          padding: '16px',
          borderBottom: '1px solid #37474f',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}>
          <h2 style={{ margin: 0, fontSize: '18px' }}>本地草稿箱</h2>
          <button
            onClick={toggleDraftPanel}
            style={{
              background: 'none',
              border: 'none',
              color: '#fff',
              fontSize: '20px',
              cursor: 'pointer',
              padding: '4px 8px',
            }}
          >
            ✕
          </button>
        </div>

        <div style={{
          padding: '12px 16px',
          borderBottom: '1px solid #37474f',
          display: 'flex',
          gap: '8px',
          alignItems: 'center',
        }}>
          {showSaveInput ? (
            <>
              <input
                type="text"
                value={draftName}
                onChange={(e) => setDraftName(e.target.value)}
                placeholder="输入草稿名称..."
                style={{
                  flex: 1,
                  padding: '8px 12px',
                  background: '#1a2328',
                  color: '#fff',
                  border: '1px solid #546e7a',
                  borderRadius: '4px',
                  fontSize: '14px',
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleSaveDraft();
                  if (e.key === 'Escape') {
                    setShowSaveInput(false);
                    setDraftName('');
                  }
                }}
                autoFocus
              />
              <button
                onClick={handleSaveDraft}
                style={{
                  padding: '8px 16px',
                  background: '#4caf50',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontSize: '14px',
                }}
              >
                保存
              </button>
              <button
                onClick={() => {
                  setShowSaveInput(false);
                  setDraftName('');
                }}
                style={{
                  padding: '8px 12px',
                  background: '#546e7a',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontSize: '14px',
                }}
              >
                取消
              </button>
            </>
          ) : (
            <button
              onClick={() => setShowSaveInput(true)}
              style={{
                width: '100%',
                padding: '10px',
                background: '#1565c0',
                color: '#fff',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: 'bold',
              }}
            >
              + 保存当前作品到草稿箱
            </button>
          )}
        </div>

        <div style={{
          flex: 1,
          overflowY: 'auto',
          padding: '16px',
        }}>
          {drafts.length === 0 ? (
            <div style={{
              textAlign: 'center',
              padding: '40px 20px',
              color: '#90a4ae',
            }}>
              <div style={{ fontSize: '48px', marginBottom: '16px' }}>📁</div>
              <div>暂无草稿，点击上方按钮保存当前作品</div>
            </div>
          ) : (
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))',
              gap: '16px',
            }}>
              {drafts.map((draft) => (
                <div
                  key={draft.id}
                  style={{
                    background: '#37474f',
                    borderRadius: '8px',
                    overflow: 'hidden',
                    display: 'flex',
                    flexDirection: 'column',
                    cursor: 'pointer',
                    transition: 'transform 0.2s',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'scale(1.02)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'scale(1)';
                  }}
                >
                  <div
                    onClick={() => {
                      loadDraft(draft.id);
                      toggleDraftPanel();
                    }}
                    style={{
                      aspectRatio: '1',
                      background: '#1a2328',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      padding: '8px',
                    }}
                  >
                    {draft.thumbnail ? (
                      <img
                        src={draft.thumbnail}
                        alt={draft.name}
                        style={{
                          maxWidth: '100%',
                          maxHeight: '100%',
                          imageRendering: 'pixelated',
                        }}
                      />
                    ) : (
                      <span style={{ color: '#546e7a', fontSize: '32px' }}>🖼️</span>
                    )}
                  </div>
                  <div style={{ padding: '8px', flex: 1 }}>
                    <div
                      style={{
                        fontSize: '13px',
                        fontWeight: 'bold',
                        marginBottom: '4px',
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                      }}
                      title={draft.name}
                    >
                      {draft.name}
                    </div>
                    <div style={{ fontSize: '11px', color: '#90a4ae', marginBottom: '8px' }}>
                      {formatDate(draft.updatedAt)}
                    </div>
                    <div style={{ display: 'flex', gap: '4px' }}>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          loadDraft(draft.id);
                          toggleDraftPanel();
                        }}
                        style={{
                          flex: 1,
                          padding: '4px 8px',
                          background: '#1565c0',
                          color: '#fff',
                          border: 'none',
                          borderRadius: '4px',
                          cursor: 'pointer',
                          fontSize: '12px',
                        }}
                      >
                        打开
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setCompareDraft(draft);
                          toggleComparePanel();
                        }}
                        style={{
                          padding: '4px 8px',
                          background: '#ff9800',
                          color: '#fff',
                          border: 'none',
                          borderRadius: '4px',
                          cursor: 'pointer',
                          fontSize: '12px',
                        }}
                        title="与当前版本对比"
                      >
                        对比
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          if (confirm('确定要删除这个草稿吗？')) {
                            deleteDraft(draft.id);
                          }
                        }}
                        style={{
                          padding: '4px 8px',
                          background: '#c62828',
                          color: '#fff',
                          border: 'none',
                          borderRadius: '4px',
                          cursor: 'pointer',
                          fontSize: '12px',
                        }}
                      >
                        删除
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div style={{
          padding: '12px 16px',
          borderTop: '1px solid #37474f',
          fontSize: '12px',
          color: '#90a4ae',
          textAlign: 'center',
        }}>
          共 {drafts.length} 个草稿，数据保存在浏览器本地
        </div>
      </div>
    </div>
  );
};
