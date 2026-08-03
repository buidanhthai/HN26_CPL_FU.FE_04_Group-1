import React, { useState, useMemo } from 'react';

interface RawAddonService {
  id: number;
  serviceName: string;
  unitPrice: number;
  chargeMethod: string;
  isAvailable: boolean;
}

interface BookingAddonsSectionProps {
  addonServices: RawAddonService[];
  selectedQuantities: Record<number, number>;
  onQuantityChange: (serviceId: number, qty: number) => void;
}

interface EnrichedAddonItem {
  id: number;
  name: string;
  price: number;
  unit: string;
  desc: string;
  category: 'coffee' | 'tea' | 'utilities' | 'devices';
  imageUrl: string;
}

// Map database fields to UI presentation models
const enrichAddon = (service: RawAddonService): EnrichedAddonItem => {
  const name = service.serviceName || '';
  const price = service.unitPrice || 0;
  const id = service.id;
  const method = service.chargeMethod || 'Fixed';

  let category: 'coffee' | 'tea' | 'utilities' | 'devices' = 'coffee';
  let desc = 'Thức uống thơm ngon phục vụ tại quầy.';
  let unit = 'phần';
  let imageUrl = '/images/services/coffee.jpg';

  const lowerName = name.toLowerCase();
  if (lowerName.includes('cà phê') || lowerName.includes('cafe') || lowerName.includes('bạc xỉu')) {
    category = 'coffee';
    desc = 'Cà phê được pha chế thơm ngon, đậm đà chuẩn vị.';
    unit = 'ly';
    imageUrl = '/images/services/coffee.jpg';
  } else if (lowerName.includes('trà') || lowerName.includes('sinh tố')) {
    category = 'tea';
    desc = 'Trà thanh mát, giải nhiệt cho ngày dài làm việc.';
    unit = 'ly';
    imageUrl = '/images/services/juice.jpg';
  } else if (lowerName.includes('bánh') || lowerName.includes('croissant')) {
    category = 'utilities';
    desc = 'Bánh ngọt tiếp năng lượng cho buổi làm việc sôi nổi.';
    unit = 'phần';
    imageUrl = '/images/services/croissant.jpg';
  } else if (lowerName.includes('in ấn') || lowerName.includes('sao chụp')) {
    category = 'utilities';
    desc = 'Hỗ trợ in ấn tài liệu tốc độ cao, chất lượng sắc nét.';
    unit = 'trang';
    imageUrl = '/images/services/printer.jpg';
  } else if (lowerName.includes('projector') || lowerName.includes('máy chiếu')) {
    category = 'devices';
    desc = 'Máy chiếu chuyên nghiệp cho cuộc họp và trình bày.';
    unit = method === 'By_Hour' ? 'giờ' : 'ngày';
    imageUrl = '/images/services/projector.jpg';
  } else if (lowerName.includes('bảng') || lowerName.includes('bút')) {
    category = 'devices';
    desc = 'Bảng di động và bút viết để chia sẻ ý tưởng tự do.';
    unit = 'bộ';
    imageUrl = '/images/services/whiteboard.jpg';
  } else {
    category = 'devices';
    desc = 'Thiết bị phục vụ công việc và hội thảo chuyên nghiệp.';
    unit = method === 'By_Hour' ? 'giờ' : 'ngày';
    imageUrl = '/images/services/projector.jpg';
  }

  return {
    id,
    name,
    price,
    unit,
    desc,
    category,
    imageUrl
  };
};

const enrichAddonsWithDifferentiatedImages = (services: RawAddonService[]): EnrichedAddonItem[] => {
  const enriched = services.map(enrichAddon);
  const categoryCount: Record<string, number> = {};

  return enriched.map((item) => {
    if (!categoryCount[item.category]) {
      categoryCount[item.category] = 1;
    } else {
      categoryCount[item.category]++;
    }

    const index = categoryCount[item.category];
    const baseUrl = item.imageUrl.replace(/\.\w+$/, '');
    const filename = baseUrl.split('/').pop() || 'coffee';
    item.imageUrl = `/images/services/${filename}${index}.jpg`;

    return item;
  });
};

export const BookingAddonsSection: React.FC<BookingAddonsSectionProps> = ({
  addonServices,
  selectedQuantities,
  onQuantityChange,
}) => {
  const [activeTab, setActiveTab] = useState<'coffee' | 'tea' | 'utilities' | 'devices'>('coffee');

  const enrichedServices = useMemo(() => {
    const available = addonServices.filter((s) => s.isAvailable);
    return enrichAddonsWithDifferentiatedImages(available);
  }, [addonServices]);

  const filteredServices = useMemo(() => {
    return enrichedServices.filter((item) => item.category === activeTab);
  }, [enrichedServices, activeTab]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      
      {/* Category Tabs */}
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        gap: '10px',
        flexWrap: 'wrap',
        borderBottom: '1px solid var(--border-color)',
        paddingBottom: '16px'
      }}>
        {[
          { key: 'coffee', label: '☕ Cà phê' },
          { key: 'tea', label: '🍹 Trà & Sinh tố' },
          { key: 'utilities', label: '🥪 Đồ ăn & Tiện ích' },
          { key: 'devices', label: '🛠️ Thiết bị & Nhân sự' }
        ].map((tab) => {
          const isActive = activeTab === tab.key;
          return (
            <button
              key={tab.key}
              type="button"
              onClick={() => setActiveTab(tab.key as any)}
              style={{
                padding: '8px 18px',
                borderRadius: '20px',
                border: '1px solid',
                borderColor: isActive ? 'var(--accent-color)' : 'var(--border-color)',
                backgroundColor: isActive ? 'var(--accent-color)' : 'transparent',
                color: isActive ? '#fff' : 'var(--secondary-text)',
                fontSize: '0.85rem',
                fontWeight: 'bold',
                cursor: 'pointer',
                transition: 'var(--transition)',
              }}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Grid of Compact Product Cards */}
      {filteredServices.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '40px 20px', color: 'var(--secondary-text)', fontSize: '0.85rem', fontStyle: 'italic' }}>
          Danh mục này hiện chưa có dịch vụ nào khả dụng.
        </div>
      ) : (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
          gap: '14px',
          maxHeight: '440px',
          overflowY: 'auto',
          padding: '4px'
        }}>
          {filteredServices.map((item) => {
            const qty = selectedQuantities[item.id] || 0;
            return (
              <div
                key={item.id}
                style={{
                  display: 'flex',
                  borderRadius: '10px',
                  border: `1px solid ${qty > 0 ? 'var(--accent-color)' : 'var(--border-color)'}`,
                  backgroundColor: qty > 0 ? 'rgba(212, 163, 115, 0.04)' : 'var(--surface-color)',
                  overflow: 'hidden',
                  padding: '10px',
                  alignItems: 'center',
                  gap: '12px',
                  transition: 'var(--transition)',
                  boxShadow: qty > 0 ? '0 4px 8px rgba(212, 163, 115, 0.1)' : 'none'
                }}
              >
                {/* Thumbnail Image */}
                <div style={{ width: '70px', height: '70px', borderRadius: '8px', overflow: 'hidden', flexShrink: 0 }}>
                  <img
                    src={item.imageUrl}
                    alt={item.name}
                    loading="lazy"
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                </div>

                {/* Details */}
                <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', flex: 1, height: '70px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '4px' }}>
                    <h5 style={{ margin: '0', fontSize: '0.85rem', fontWeight: 'bold', color: 'var(--primary-text)', lineHeight: '1.2' }}>
                      {item.name}
                    </h5>
                    <div style={{ fontSize: '0.8rem', fontWeight: 'bold', color: 'var(--accent-hover)', flexShrink: 0 }}>
                      {item.price.toLocaleString('vi-VN')}đ
                      <span style={{ fontSize: '0.65rem', fontWeight: 'normal', color: 'var(--secondary-text)' }}>/{item.unit}</span>
                    </div>
                  </div>
                  
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 'auto', gap: '8px' }}>
                    <span style={{ fontSize: '0.7rem', color: 'var(--secondary-text)', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap', flex: 1 }}>
                      {item.desc}
                    </span>
                    
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexShrink: 0 }}>
                      <button
                        type="button"
                        onClick={() => onQuantityChange(item.id, Math.max(0, qty - 1))}
                        style={{
                          width: '22px',
                          height: '22px',
                          borderRadius: '4px',
                          border: '1px solid var(--border-color)',
                          backgroundColor: 'var(--background-color)',
                          color: 'var(--primary-text)',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontWeight: 'bold',
                          fontSize: '0.8rem'
                        }}
                      >
                        -
                      </button>
                      <span style={{ fontSize: '0.8rem', fontWeight: 'bold', minWidth: '14px', textAlign: 'center' }}>
                        {qty}
                      </span>
                      <button
                        type="button"
                        onClick={() => onQuantityChange(item.id, Math.min(20, qty + 1))}
                        style={{
                          width: '22px',
                          height: '22px',
                          borderRadius: '4px',
                          border: '1px solid var(--border-color)',
                          backgroundColor: 'var(--background-color)',
                          color: 'var(--primary-text)',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontWeight: 'bold',
                          fontSize: '0.8rem'
                        }}
                      >
                        +
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
