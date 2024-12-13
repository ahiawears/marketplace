const ModalBackdrop = ({ disableInteraction }: { disableInteraction: boolean }) => (
    <div 
      className={`fixed inset-0 z-[1000] ${disableInteraction ? 'pointer-events-auto' : ''}`}
    >
    </div>
);

export default ModalBackdrop