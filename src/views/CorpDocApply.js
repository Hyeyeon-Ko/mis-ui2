import Breadcrumb from '../components/common/Breadcrumb';
import '../styles/common/Page.css';
import '../styles/CorpDocApply.css';

function CorpDocApply() {
    
    return (
    <div className="content">
      <div className="corpDoc-content">
        <h2>법인서류</h2>
        <Breadcrumb items={['신청하기', '법인서류']} />
      </div>
    </div>
  );
}

export default CorpDocApply;
