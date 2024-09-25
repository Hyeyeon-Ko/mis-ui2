import React, { useEffect, useRef, useState, useCallback } from 'react'; 
import PropTypes from 'prop-types';
import axios from 'axios';
import '../../styles/bcd/PreviewModal.css';
import frontImageBlank from '../../assets/images/frontimage_blank.png';
import backImageEngBlank from '../../assets/images/backimage_eng_blank.png';
import backImageCompany from '../../assets/images/backimage_company.png';

const PreviewModal = ({ show, onClose, formData }) => {
  const canvasRef = useRef(null);
  const [bcdData, setBcdData] = useState({
    instInfo: [],
    deptInfo: [],
    teamInfo: [],
    gradeInfo: [],
  });

  // fetchBcdStd 함수
  const fetchBcdStd = async () => {
    try {
      const response = await axios.get(`/api/std/bcd`);
      if (response.data && response.data.data) {
        const data = response.data.data;
        setBcdData(data);
        console.log('Fetched BCD data:', data);
      } else {
        console.error('No standard data found');
        alert('기준자료를 불러오는 중 오류가 발생했습니다.');
      }
    } catch (error) {
      console.error('Error fetching BCD standard data:', error.response ? error.response.data : error.message);
      alert('기준자료를 불러오는 중 오류가 발생했습니다.');
    }
  };

  // drawBusinessCard 함수
  const drawBusinessCard = useCallback(() => {
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

    const findDetailName = (list, detailCd) => {
      const item = list.find(i => i.detailCd === detailCd);
      return item ? item.detailNm : '';
    };

    const findEngName = (list, detailCd) => {
      const item = list.find(i => i.detailCd === detailCd);
      return item ? item.etcItem2 : '';
    };

    const centerName = findDetailName(bcdData.instInfo, formData.center);
    const teamName = formData.team !== '000' ? findDetailName(bcdData.teamInfo, formData.team) : formData.addTeamNm;
    const positionName = formData.position === '000' ? formData.addGradeNm : findDetailName(bcdData.gradeInfo, formData.position);
    const engPositionName = formData.position === '000' ? formData.enGradeNm : findEngName(bcdData.gradeInfo, formData.position);
    const engTeamName = formData.team !== '000' ? findEngName(bcdData.teamInfo, formData.team) : formData.addEngTeamNm;

    imageKorean.onload = () => {
      ctx.drawImage(imageKorean, 0, 0, canvas.width / 2, canvas.height);

      const darkGray = '#747576';
      const black = '#1A1A1A';

      ctx.font = 'bold 26.4px Arial';
      ctx.fillStyle = black;
      drawTextWithSpacing(ctx, formData.name, 64, 198, 2.4);

      ctx.font = '13.6px Arial';
      ctx.fillStyle = black;
      drawTextWithSpacing(ctx, `${centerName} ${teamName}`, 64, 226.4, -0.4);

      drawTextWithSpacing(ctx, positionName, 64, 244.8, -0.4);

      ctx.fillStyle = darkGray;
      drawTextWithSpacing(ctx, `www.kmi.or.kr`, 64, 304, 0.4);
      drawTextWithSpacing(ctx, `${formData.firstName}, ${formData.lastName}`, 153.6, 199.2, 0);

      ctx.fillStyle = 'black';
      ctx.font = '15.2px Arial';
      ctx.fillText(`Tel`, 270, 187.2);
      ctx.fillText(`Fax`, 270, 214.4);
      ctx.fillText(`Mobile`, 270, 241.6);
      ctx.fillText(`E-Mail`, 270, 268.8);

      ctx.font = '15.2px Arial';
      ctx.fillText(`${formData.phone1}.${formData.phone2}.${formData.phone3}`, 334, 187.2);
      ctx.fillText(`${formData.fax1}.${formData.fax2}.${formData.fax3}`, 334, 214.4);
      ctx.fillText(`${formData.mobile1}.${formData.mobile2}.${formData.mobile3}`, 334, 241.6);
      ctx.fillText(`${formData.email}@kmi.or.kr`, 334, 268.8);

      ctx.font = '13.6px Arial';
      const addressParts = formData.address.split(',');

      if (addressParts.length === 2) {
        const mainAddress = addressParts[0];
        const floorAddress = addressParts[1].trim() + '층';
        const fullAddress = `${mainAddress} ${floorAddress}`;

        drawTextWithSpacing(ctx, fullAddress, 270, 302.4, -1.2);
      } else {
        drawTextWithSpacing(ctx, formData.address, 270, 302.4, -1.2);
      }
    };

    imageEnglish.onload = () => {
      ctx.drawImage(imageEnglish, canvas.width / 2, 0, canvas.width / 2, canvas.height);

      if (formData.cardType === 'personal') {
        const darkGray = '#747576';
        const black = '#1A1A1A';

        ctx.font = 'bold 26.4px Arial';
        ctx.fillStyle = black;
        drawTextWithSpacing(ctx, `${formData.lastName} ${formData.firstName}`, 624, 176, 0.4);

        ctx.font = '13.6px Arial';
        ctx.fillStyle = black;
        drawTextWithSpacing(ctx, `${engTeamName}`, 624, 205.6, 0.16);
        drawTextWithSpacing(ctx, `${engPositionName}`, 624, 225, 0.16);

        ctx.font = '15.2px Arial';
        ctx.fillStyle = darkGray;
        drawTextWithSpacing(ctx, `www.kmi.or.kr`, 624, 304, 0.4);

        ctx.fillStyle = black;
        ctx.fillText(`Tel`, 840, 164.8);
        ctx.fillText(`Fax`, 840, 192);
        ctx.fillText(`Mobile`, 840, 219.2);
        ctx.fillText(`E-Mail`, 840, 246.4);
        ctx.fillText(`Office`, 840, 284.8);

        ctx.font = '15.2px Arial';
        ctx.fillText(formatPhoneNumber(82, `${formData.phone1.slice(1)}.${formData.phone2}.${formData.phone3}`), 904, 164.8);
        ctx.fillText(formatPhoneNumber(82, `${formData.fax1.slice(1)}.${formData.fax2}.${formData.fax3}`), 904, 192);
        ctx.fillText(formatPhoneNumber(82, `${formData.mobile1.slice(1)}.${formData.mobile2}.${formData.mobile3}`), 904, 219.2);
        ctx.fillText(`${formData.email}@kmi.or.kr`, 904, 246.4);

        ctx.font = '14.6px Arial';
        const engAddressParts = formData.engAddress.split(',');
        if (engAddressParts.length >= 3) {
          const mainEngAddress = engAddressParts.slice(0, 3).join(',').trim();
          const nextLineEngAddress = engAddressParts.slice(3).join(',').trim();
          drawTextWithSpacing(ctx, mainEngAddress, 904, 284.8, -0.56);
          drawTextWithSpacing(ctx, nextLineEngAddress, 840, 304.8, -0.08);
        } else {
          drawTextWithSpacing(ctx, formData.engAddress, 904, 284.8, -0.56);
        }
      }
    };
  }, [formData, bcdData]);

  useEffect(() => {
    if (show) {
      fetchBcdStd();
    }
  }, [show]);

  useEffect(() => {
    if (show) {
      console.log('PreviewModal props:', formData);
      drawBusinessCard();
    }
  }, [show, formData, drawBusinessCard]); 

  const formatPhoneNumber = (countryCode, number) => {
    const [part1, part2, part3] = number.split('.');
    return `+${countryCode}.${part1}.${part2}.${part3}`;
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
        <canvas ref={canvasRef} width="1120" height="360"></canvas>
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
