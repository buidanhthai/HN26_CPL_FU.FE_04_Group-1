import React from 'react';
import { VisualFloorMapModal } from './VisualFloorMapModal';
import { BookingDetailModal } from './BookingDetailModal';
import { BookingCheckoutModal } from './BookingCheckoutModal';

interface BookingModalsContainerProps {
  isMapModalOpen: boolean;
  setIsMapModalOpen: (val: boolean) => void;
  selectedBookingDetails: any;
  setSelectedBookingDetails: (val: any) => void;
  checkoutDetails: any;
  setCheckoutDetails: (val: any) => void;
  spaceAssets: any[];
  setAssetId: (id: number) => void;
  fetchBookings: () => void;
  handleConfirmCheckout: (id: number) => Promise<void>;
  handlePayFinal: (id: number) => Promise<void>;
}

export const BookingModalsContainer: React.FC<BookingModalsContainerProps> = ({
  isMapModalOpen,
  setIsMapModalOpen,
  selectedBookingDetails,
  setSelectedBookingDetails,
  checkoutDetails,
  setCheckoutDetails,
  spaceAssets,
  setAssetId,
  fetchBookings,
  handleConfirmCheckout,
  handlePayFinal,
}) => {
  return (
    <>
      <VisualFloorMapModal
        isOpen={isMapModalOpen}
        onClose={() => setIsMapModalOpen(false)}
        spaceAssets={spaceAssets}
        onSelectRoom={(room) => setAssetId(room.id)}
      />

      <BookingDetailModal
        details={selectedBookingDetails}
        onClose={() => setSelectedBookingDetails(null)}
        spaceAssets={spaceAssets}
        onRefresh={fetchBookings}
      />

      <BookingCheckoutModal
        details={checkoutDetails}
        onClose={() => {
          setCheckoutDetails(null);
          fetchBookings();
        }}
        onConfirmCheckout={async () => {
          if (checkoutDetails) {
            await handleConfirmCheckout(checkoutDetails.booking.id);
          }
        }}
        onPayFinal={async () => {
          if (checkoutDetails) {
            await handlePayFinal(checkoutDetails.booking.id);
          }
        }}
        spaceAssets={spaceAssets}
      />
    </>
  );
};
