import corporateSeal from '../assets/images/corporate_seal.png';
import facsimileSeal from '../assets/images/facsimile_seal.png';
import companySeal from '../assets/images/company_seal.png';

export const sealOptions = [
    {
        name: 'corporateSeal',
        label: '법인인감',
        image: corporateSeal,
    },
    {
        name: 'facsimileSeal',
        label: '사용인감',
        image: facsimileSeal,
    },
    {
        name: 'companySeal',
        label: '회사인',
        image: companySeal,
    },
];

export const SealOption = ({ seal, selection, onSealChange, onQuantityChange }) => (
    <label>
        <div className='seal-imprint-detail-option'>
            <div className='seal-imprint-detail-left'>
                <input
                    type="checkbox"
                    name={seal.name}
                    checked={selection.selected}
                    onChange={() => onSealChange(seal.name)}
                />
            </div>
            <div className='seal-imprint-detail-right'>
                <img src={seal.image} alt={`${seal.label} Seal`} className="seal-imprint-image" />
                <span>{seal.label}</span>
                <input
                    type="number"
                    name={`${seal.name}Quantity`}
                    min="1"
                    placeholder="수량"
                    value={selection.quantity}
                    onChange={(e) => onQuantityChange(e, seal.name)}
                    disabled={!selection.selected}
                />
            </div>
        </div>
    </label>
);

export const sealImages = {
    corporateSeal: corporateSeal,
    facsimileSeal: facsimileSeal,
    companySeal: companySeal,
};

const sealLabels = {
    corporateSeal: '법인인감',
    facsimileSeal: '사용인감',
    companySeal: '회사인',
};

export const SealCheckbox = ({ sealName, sealData, onSealChange, onQuantityChange }) => (
    <label>
        <div className='seal-imprint-detail-option'>
            <div className='seal-imprint-detail-left'>
                <input
                    type="checkbox"
                    name={sealName}
                    checked={sealData.selected}
                    onChange={() => onSealChange(sealName)}
                />
            </div>
            <div className='seal-imprint-detail-right'>
                <img src={sealImages[sealName]} alt={`${sealLabels[sealName]} Seal`} className="seal-imprint-image" />
                <span>{sealLabels[sealName]}</span>
                <input
                    type="number"
                    name={`${sealName}Quantity`}
                    min="1"
                    placeholder="수량"
                    value={sealData.quantity}
                    onChange={(e) => onQuantityChange(e, sealName)}
                    disabled={!sealData.selected}
                />
            </div>
        </div>
    </label>
);

export const sealRegistrationData = {
    seal: '',
    sealImage: null,
    department: '',
    purpose: '',
    manager: '',
    subManager: '',
    date: '',
}

export const applicationData = {
    submission: '',
    useDept: '',
    expNm: '',
    expDate: '',
    returnDate: '',
    purpose: '',
    file: null,
    fileName: '',  
    filePath: '',  
    isFileDeleted: false,
}

export const applicationDetailData = {
    submission: '',
    useDate: '',
    purpose: '',
    notes: '',
}

export const sealSelectionData = {
    corporateSeal: { selected: false, quantity: '' },
    facsimileSeal: { selected: false, quantity: '' },
    companySeal: { selected: false, quantity: '' },
}