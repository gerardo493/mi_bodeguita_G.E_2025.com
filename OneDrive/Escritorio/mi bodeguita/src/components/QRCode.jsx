import { QRCodeSVG } from 'qrcode.react';

const QRCode = ({ value, size = 128, level = 'M' }) => {
    return (
        <QRCodeSVG
            value={value}
            size={size}
            level={level}
            includeMargin={true}
        />
    );
};

export default QRCode;

