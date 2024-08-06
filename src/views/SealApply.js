import Breadcrumb from '../components/common/Breadcrumb';
import '../styles/common/Page.css';
import '../styles/SealApply.css';

function CorpDocApply() {
    
    return (
    <div className="content">
      <div className="seal-content">
        <h2>인장관리</h2>
        <Breadcrumb items={['신청하기', '인장관리']} />
      </div>
    </div>
  );
}

export default CorpDocApply;
