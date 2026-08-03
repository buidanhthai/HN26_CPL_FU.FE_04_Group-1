import React from 'react';

interface SelectedAddon {
  serviceId: number;
  quantity: number;
}

interface AddonService {
  id: number;
  serviceName: string;
  unitPrice: number;
  chargeMethod: string;
  isAvailable: boolean;
}

interface BookingPriceEstimateProps {
  spaceCost: number;
  addonsCost: number;
  totalAmount: number;
  loading: boolean;
  duration: number;
  selectedAddonsList: SelectedAddon[];
  addonServices: AddonService[];
  spaceAssets: any[];
  assetId: number;
  layoutId: number;
}

export const BookingPriceEstimate: React.FC<BookingPriceEstimateProps> = ({
  spaceCost,
  addonsCost,
  totalAmount,
  loading,
  duration,
  selectedAddonsList,
  addonServices,
  spaceAssets,
  assetId,
  layoutId,
}) => {
  const selectedAsset = spaceAssets.find((a) => a.id === assetId || a.Id === assetId);
  const roomName = selectedAsset?.assetName || 'Chưa chọn không gian';
  const basePrice = selectedAsset?.basePrice || 0;

  const layoutModifier = layoutId === 1 && assetId === 2 ? 50000 : 0;
  const layoutName = layoutId === 1 && assetId === 2 ? 'Chữ U' : 'Lớp học';

  // Calculate detailed items
  const calculatedRoomCost = basePrice * duration;
  const calculatedLayoutCost = layoutModifier * duration;

  return (
    <div style={{
      marginTop: '24px',
      position: 'relative',
      filter: 'drop-shadow(0 6px 12px rgba(0,0,0,0.08))',
    }}>
      {/* Torn paper thermal bill container */}
      <div style={{
        backgroundColor: '#faf7f2',
        color: '#2b201a',
        padding: '24px',
        fontFamily: '"Courier New", Courier, monospace, monospace',
        borderTop: '4px dashed #dfd5c6',
        borderBottom: '4px dashed #dfd5c6',
        borderRadius: '2px',
        boxShadow: 'inset 0 0 40px rgba(0,0,0,0.02)',
      }}>
        {/* Loading Overlay */}
        {loading && (
          <div style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(250, 247, 242, 0.7)',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: 5,
          }}>
            <span style={{ fontSize: '0.85rem', fontWeight: 'bold', letterSpacing: '1px' }}>⌛ ĐANG TÍNH GIÁ...</span>
          </div>
        )}

        {/* Bill Header */}
        <div style={{ textAlign: 'center', marginBottom: '16px' }}>
          <h3 style={{ margin: '0 0 4px 0', fontSize: '1.2rem', fontWeight: 'bold', letterSpacing: '1px' }}>COZY SPACE</h3>
          <p style={{ margin: 0, fontSize: '0.75rem', opacity: 0.8 }}>HÓA ĐƠN ĐẶT TRƯỚC TẠM TÍNH</p>
          <p style={{ margin: '2px 0 0 0', fontSize: '0.65rem', opacity: 0.6 }}>----------------------------------</p>
        </div>

        {/* Room & layout details */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '0.8rem', borderBottom: '1px dashed #dfd5c6', paddingBottom: '12px', marginBottom: '12px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <span style={{ flex: 1, paddingRight: '12px' }}>
              {roomName}
              <div style={{ fontSize: '0.7rem', opacity: 0.7, marginTop: '2px' }}>
                {duration.toFixed(1)} giờ x {basePrice.toLocaleString('vi-VN')}đ/h
              </div>
            </span>
            <span style={{ fontWeight: 'bold' }}>
              {calculatedRoomCost.toLocaleString('vi-VN')}đ
            </span>
          </div>

          {layoutModifier > 0 && (
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <span style={{ flex: 1, paddingRight: '12px' }}>
                Phí setup: Sơ đồ {layoutName}
                <div style={{ fontSize: '0.7rem', opacity: 0.7, marginTop: '2px' }}>
                  {duration.toFixed(1)} giờ x {layoutModifier.toLocaleString('vi-VN')}đ/h
                </div>
              </span>
              <span style={{ fontWeight: 'bold' }}>
                {calculatedLayoutCost.toLocaleString('vi-VN')}đ
              </span>
            </div>
          )}
        </div>

        {/* Addon Services list */}
        {selectedAddonsList.length > 0 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.8rem', borderBottom: '1px dashed #dfd5c6', paddingBottom: '12px', marginBottom: '12px' }}>
            <div style={{ fontSize: '0.75rem', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '4px' }}>
              Dịch vụ đi kèm:
            </div>
            
            {selectedAddonsList.map((item) => {
              const svc = addonServices.find((s) => s.id === item.serviceId);
              if (!svc) return null;
              
              const itemTotal = svc.chargeMethod === 'By_Hour'
                ? svc.unitPrice * duration * item.quantity
                : svc.unitPrice * item.quantity;
                
              return (
                <div key={item.serviceId} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <span style={{ flex: 1, paddingRight: '12px' }}>
                    + {svc.serviceName} (x{item.quantity})
                    <div style={{ fontSize: '0.7rem', opacity: 0.7, marginTop: '2px' }}>
                      {svc.unitPrice.toLocaleString('vi-VN')}đ/{svc.chargeMethod === 'By_Hour' ? 'giờ' : 'phần'}
                      {svc.chargeMethod === 'By_Hour' && ` x ${duration.toFixed(1)}h`}
                    </div>
                  </span>
                  <span style={{ fontWeight: 'bold' }}>
                    {itemTotal.toLocaleString('vi-VN')}đ
                  </span>
                </div>
              );
            })}
          </div>
        )}

        {/* Summary total */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '0.8rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span>Phòng & Thiết lập:</span>
            <span>{spaceCost.toLocaleString('vi-VN')}đ</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span>Tổng tiền dịch vụ:</span>
            <span>{addonsCost.toLocaleString('vi-VN')}đ</span>
          </div>

          <div style={{ margin: '8px 0 4px 0', fontSize: '0.7rem', opacity: 0.6 }}>==================================</div>

          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            fontSize: '1rem',
            fontWeight: 'bold',
            marginTop: '4px'
          }}>
            <span>TỔNG TIỀN ĐƠN:</span>
            <span style={{ borderBottom: '3px double #2b201a' }}>
              {totalAmount.toLocaleString('vi-VN')}đ
            </span>
          </div>
        </div>

        {/* Torn paper footer watermark */}
        <div style={{ textAlign: 'center', marginTop: '20px', fontSize: '0.7rem', opacity: 0.5 }}>
          <span>* CẢM ƠN QUÝ KHÁCH *</span>
        </div>
      </div>
    </div>
  );
};
