import '../../styles/common/Loading.css';
import Spinner from '../../assets/images/spinner.gif'

const Loading = () => {
  return (
    <div className='background'>
        <div className='loading-text'>잠시만 기다려 주세요!</div>
        <img src={Spinner} alt='로딩중' width="10%" />
    </div>
  )
}

export default Loading