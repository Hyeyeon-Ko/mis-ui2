import React, { useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import '../styles/PreviewModal.css';
import frontImageBlank from '../assets/images/frontimage_blank.png';
import backImageEngBlank from '../assets/images/backimage_eng_blank.png';
import backImageCompany from '../assets/images/backimage_company.png';

const PreviewModal = ({ show, onClose, formData }) => {
  const canvasRef = useRef(null);

  useEffect(() => {
    if (show) {
      drawBusinessCard();
    }
  }, [show]);

  const formatPhoneNumber = (countryCode, number) => {
    const [part1, part2, part3] = number.split('.');
    return `+${countryCode}.${part1}.${part2}.${part3}`;
  };

  const drawBusinessCard = () => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const imageKorean = new Image();
    const imageEnglish = new Image();

    imageKorean.src = frontImageBlank;

    if (formData.cardType === 'personal') {
      imageEnglish.src = backImageEngBlank;
    } else {
      imageEnglish.src = backImageCompany;
    }

    imageKorean.onload = () => {
      ctx.drawImage(imageKorean, 0, 0, canvas.width / 2, canvas.height);

      const darkGray = '#747576';
      const black = '#1A1A1A';

      // Draw name with larger font size
      ctx.font = 'bold 33px Arial';
      ctx.fillStyle = black;
      drawTextWithSpacing(ctx, formData.name, 80, 249, 3);

      // Draw other text with standard font size
      ctx.font = '17px Arial';
      ctx.fillStyle = black;
      drawTextWithSpacing(ctx, `${formData.center} ${formData.team}`, 80, 283, -0.5);
      drawTextWithSpacing(ctx, formData.position, 80, 306, -0.5);
      ctx.fillStyle = darkGray;
      drawTextWithSpacing(ctx, `www.kmi.or.kr`, 80, 380, 0.5);
      drawTextWithSpacing(ctx, `${formData.firstName}, ${formData.lastName}`, 192, 249, 0);

      ctx.fillStyle = 'black';
      ctx.font = '19px Arial';
      ctx.fillText(`Tel`, 350, 234);
      ctx.fillText(`Fax`, 350, 268);
      ctx.fillText(`Mobile`, 350, 302);
      ctx.fillText(`E-Mail`, 350, 336);

      ctx.font = 'normal 18px Arial';
      ctx.fillText(`${formData.phone1}.${formData.phone2}.${formData.phone3}`, 430, 234);
      ctx.fillText(`${formData.fax1}.${formData.fax2}.${formData.fax3}`, 430, 268);
      ctx.fillText(`${formData.mobile1}.${formData.mobile2}.${formData.mobile3}`, 430, 302);
      ctx.fillText(`${formData.email}@kmi.or.kr`, 430, 336);

      ctx.font = 'normal 17px Arial';

      const addressParts = formData.address.split(',');
      console.log(addressParts)

      if (addressParts.length === 2) {
        const mainAddress = addressParts[0];
        const floorAddress = addressParts[1].trim() + '층';
        const fullAddress = `${mainAddress} ${floorAddress}`;

        drawTextWithSpacing(ctx, fullAddress, 350, 378, -1.5);
      } else {
        drawTextWithSpacing(ctx, formData.address, 350, 378, -1.5);
      }
    };

    imageEnglish.onload = () => {
      ctx.drawImage(imageEnglish, canvas.width / 2, 0, canvas.width / 2, canvas.height);

      if (formData.cardType === 'personal') {
        const darkGray = '#747576';
        const black = '#1A1A1A';

        // Draw English name with larger font size
        ctx.font = 'bold 33px Arial';
        ctx.fillStyle = black;
        drawTextWithSpacing(ctx, `${formData.lastName} ${formData.firstName}`, 780, 220, 0.5);

        // Draw other text with standard font size
        ctx.font = '18px Arial';
        ctx.fillStyle = black;
        drawTextWithSpacing(ctx, `${formData.engPosition} - ${formData.engTeam}`, 780, 257, 0.2);
        ctx.fillStyle = darkGray;
        drawTextWithSpacing(ctx, `www.kmi.or.kr`, 780, 380, 0.5);

        ctx.fillStyle = 'black';
        ctx.font = '19px Arial';
        ctx.fillText(`Tel`, 1050, 206);
        ctx.fillText(`Fax`, 1050, 240);
        ctx.fillText(`Mobile`, 1050, 274);
        ctx.fillText(`E-Mail`, 1050, 308);
        ctx.fillText(`Office`, 1050, 356);

        ctx.font = 'normal 19px Arial';
        ctx.fillText(formatPhoneNumber(82, `${formData.phone1.slice(1)}.${formData.phone2}.${formData.phone3}`), 1130, 206);
        ctx.fillText(formatPhoneNumber(82, `${formData.fax1.slice(1)}.${formData.fax2}.${formData.fax3}`), 1130, 240);
        ctx.fillText(formatPhoneNumber(82, `${formData.mobile1.slice(1)}.${formData.mobile2}.${formData.mobile3}`), 1130, 274);
        ctx.fillText(`${formData.email}@kmi.or.kr`, 1130, 308);

        ctx.font = 'normal 19px Arial';

        const engAddressParts = formData.engAddress.split(',');
        if (engAddressParts.length >= 3) {
          const mainEngAddress = engAddressParts.slice(0, 3).join(',').trim();
          const nextLineEngAddress = engAddressParts.slice(3).join(',').trim();
          drawTextWithSpacing(ctx, mainEngAddress, 1130, 356, -0.7);
          drawTextWithSpacing(ctx, nextLineEngAddress, 1050, 381, -0.1);
        } else {
          drawTextWithSpacing(ctx, formData.engAddress, 1130, 356, -0.7);
        }
      }
    };
  };

  const drawTextWithSpacing = (ctx, text, x, y, spacing) => {
    for (let i = 0; i < text.length; i++) {
      ctx.fillText(text[i], x, y);
      x += ctx.measureText(text[i]).width + spacing;
    }
  };

  if (!show) return null;

  return (
    <div className="preview-modal-overlay">
      <div className="preview-modal-container">
        <div className="preview-modal-header">
          <h3>명함 시안 미리보기</h3>
          <button className="preview-close-button" onClick={onClose}>X</button>
        </div>
        <p>입력된 정보를 바탕으로 제작한 명함 시안입니다. 잘못된 정보가 없는지 다시 한번 확인해주세요.</p>
        <canvas ref={canvasRef} width="1400" height="450"></canvas>
        <div className="labels">
          <span>앞 면</span>
          <span>뒷 면</span>
        </div>
      </div>
    </div>
  );
};

PreviewModal.propTypes = {
  show: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  formData: PropTypes.object.isRequired,
};

export default PreviewModal;
