import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  fetchCommission,
  updateCommission,
} from '../redux/slices/commissionSlice';

const UpdateCommissionPage = () => {
  const dispatch = useDispatch();
  const commission = useSelector((state) => state.commission.value);
  const commissionStatus = useSelector((state) => state.commission.status);
  const [newCommission, setNewCommission] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (commissionStatus === 'idle') {
      dispatch(fetchCommission());
    }
  }, [commissionStatus, dispatch]);

  const handleUpdateCommission = () => {
    setLoading(true);
    dispatch(updateCommission(newCommission));
    setLoading(false);
   
  };

  return (
    <div className="container  p-6 min-h-screen">
      <div className="max-w-lg   rounded-lg p-6 text-white">
        <h1 className="text-3xl font-semibold text-white mb-6">
          Update Commission
        </h1>
        {commission !== null ? (
          <div className="">
            <p className="text-xl text-white mb-4">
              <span className="font-bold">Current Commission: </span>
              {commission}%
            </p>

            <div className="mb-6">
              <label
                htmlFor="newCommission"
                className="block text-lg font-medium text-white mb-2"
              >
                Enter New Commission:
              </label>
              <input
                type="number"
                id="newCommission"
                value={newCommission}
                onChange={(e) => setNewCommission(e.target.value)}
                className="w-full p-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
                placeholder="Enter new commission value"
              />
            </div>

            <button
              onClick={handleUpdateCommission}
              disabled={loading || newCommission === ''}
              className={`bg-blue-500 text-white font-semibold py-2 px-4 rounded-md transition duration-200 ${
                loading || newCommission === ''
                  ? 'opacity-50 cursor-not-allowed'
                  : 'hover:bg-blue-600'
              }`}
            >
              {loading ? 'Updating...' : 'Update Commission'}
            </button>
          </div>
        ) : (
          <p className="text-center text-gray-600">
            Loading current commission...
          </p>
        )}
      </div>
    </div>
  );
};

export default UpdateCommissionPage;
