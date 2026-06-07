import React, { useState, useEffect } from 'react';
import { useCanvasStore } from '../store/canvas';
import { TEMPLATE_CATEGORIES } from '../data/templates';

export const TemplatePanel: React.FC = () => {
  const { templatePanelOpen, toggleTemplatePanel, templates, loadTemplate, loadTemplates } = useCanvasStore();
  const [selectedCategory, setSelectedCategory] = useState<string>('avatar');

  useEffect(() => {
    if (templatePanelOpen && templates.length === 0) {
      loadTemplates();
    }
  }, [templatePanelOpen, templates.length, loadTemplates]);

  if (!templatePanelOpen) return null;

  const filteredTemplates = templates.filter(t => t.category === selectedCategory);

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(0, 0, 0, 0.7)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
    }}>
      <div style={{
        background: '#263238',
        color: '#fff',
        borderRadius: '12px',
        width: '600px',
        maxHeight: '80vh',
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.5)',
        display: 'flex',
        flexDirection: 'column',
      }}>
        <div style={{
          padding: '16px 24px',
          borderBottom: '1px solid #37474f',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}>
          <h2 style={{ margin: 0, fontSize: '20px', fontWeight: 'bold' }}>选择模板</h2>
          <button
            onClick={toggleTemplatePanel}
            style={{
              background: 'none',
              border: 'none',
              color: '#90a4ae',
              fontSize: '24px',
              cursor: 'pointer',
              padding: '4px 8px',
            }}
          >
            ✕
          </button>
        </div>

        <div style={{
          padding: '12px 24px',
          borderBottom: '1px solid #37474f',
          display: 'flex',
          gap: '8px',
        }}>
          {TEMPLATE_CATEGORIES.map((category) => (
            <button
              key={category.id}
              onClick={() => setSelectedCategory(category.id)}
              style={{
                padding: '8px 16px',
                background: selectedCategory === category.id ? '#1565c0' : '#37474f',
                color: '#fff',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
                fontSize: '14px',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
              }}
            >
              <span>{category.icon}</span>
              <span>{category.name}</span>
            </button>
          ))}
        </div>

        <div style={{
          padding: '20px 24px',
          overflowY: 'auto',
          flex: 1,
        }}>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: '16px',
          }}>
            {filteredTemplates.map((template) => (
              <div
                key={template.id}
                onClick={() => loadTemplate(template)}
                style={{
                  background: '#1a2328',
                  borderRadius: '8px',
                  padding: '16px',
                  cursor: 'pointer',
                  border: '2px solid transparent',
                  transition: 'all 0.2s',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = '#1565c0';
                  e.currentTarget.style.transform = 'translateY(-2px)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = 'transparent';
                  e.currentTarget.style.transform = 'translateY(0)';
                }}
              >
                <div style={{
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  height: '100px',
                  marginBottom: '12px',
                  background: '#37474f',
                  borderRadius: '6px',
                }}>
                  {template.thumbnail ? (
                    <img
                      src={template.thumbnail}
                      alt={template.name}
                      style={{
                        imageRendering: 'pixelated',
                        maxWidth: '80px',
                        maxHeight: '80px',
                      }}
                    />
                  ) : (
                    <span style={{ color: '#546e7a' }}>预览</span>
                  )}
                </div>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '14px', fontWeight: '500', marginBottom: '4px' }}>
                    {template.name}
                  </div>
                  <div style={{ fontSize: '12px', color: '#90a4ae' }}>
                    {template.width} × {template.height}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div style={{
          padding: '16px 24px',
          borderTop: '1px solid #37474f',
          display: 'flex',
          justifyContent: 'flex-end',
        }}>
          <button
            onClick={toggleTemplatePanel}
            style={{
              padding: '10px 20px',
              background: '#37474f',
              color: '#fff',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '14px',
            }}
          >
            取消
          </button>
        </div>
      </div>
    </div>
  );
};
