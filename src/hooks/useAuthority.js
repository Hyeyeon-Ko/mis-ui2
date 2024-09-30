import { useState } from "react";

const useAuthority = () => {
    const [role, setRole] = useState('');
    const [isStandardChecked, setIsStandardChecked] = useState(false);
    const [queryResult, setQueryResult] = useState([]);

    const handleRoleChange = (e) => {
        const selectedRole = e.target.value;
        setRole(selectedRole);
    
        if (selectedRole === 'MASTER') {
          setIsStandardChecked(true);
        } else {
          setIsStandardChecked(false);
        }
    
        setQueryResult(prevResult => {
          if (prevResult.length > 0) {
            return [{
              ...prevResult[0],
              role: selectedRole,
              permissions: {
                standardDataManagement: selectedRole === 'MASTER',
              }
            }];
          } else {
            return prevResult;
          }
        });
      };

      const handleCheckboxChange = () => {
        if (role === 'MASTER') {
          alert('MASTER 권한의 경우 기준자료관리는 필수입니다.');
          return;
        }
        setIsStandardChecked(!isStandardChecked);
    
        setQueryResult(prevResult => {
          if (prevResult.length > 0) {
            return [{
              ...prevResult[0],
              permissions: {
                standardDataManagement: !isStandardChecked
              }
            }];
          } else {
            return prevResult;
          }
        });
      };
    
  return { handleRoleChange, handleCheckboxChange, role, isStandardChecked, queryResult, setRole, setIsStandardChecked, setQueryResult}
}

export default useAuthority