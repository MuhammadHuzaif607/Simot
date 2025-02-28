import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
} from '@mui/material';
import { useDispatch, useSelector } from 'react-redux';
import {
  clearRepairState,
  fetchRepairProduct,
  updateRepairDetails,
} from '../redux/slices/repairSlice';
import { toast } from 'react-toastify';

const DeviceModal = ({ open, onClose, selectedDevice }) => {
  const [selectedOrdinary, setSelectedOrdinary] = useState(''); // Only one allowed
  const [selectedExtra, setSelectedExtra] = useState([]);
  const [info, setInfo] = useState('');
  const [showInfoField, setShowInfoField] = useState(false);
  const dispatch = useDispatch();
  const {
    repairProduct,
    materialCost,
    technicianCost,
    updatedRepair,
    loading,
  } = useSelector((state) => state.repair);
  const selectedImei = useSelector((state) => state.repair.selectedDevice);

  const ordinaryOptions = [
    'lcd', // LCD
    'batt', // BATT
    'lcdBatt', // LCD + BATT
    'scocLcd', // SCOCCA + LCD
    'scocBatt', // SCOCCA + BATT
    'scocca', // SCOCCA
    'scBattLcd', // SCOCCA + LCD + BATT
  ];
  const extraOptions = ['cam', 'fId', 'washing', 'ASSIST'];

  useEffect(() => {
    if (!open) {
      setSelectedOrdinary('');
      setSelectedExtra([]);
      setInfo('');
      setShowInfoField(false);
    }
  }, [open]);

  // Handle ordinary selection (only one allowed)
  const handleOrdinaryChange = (option) => {
    setSelectedOrdinary(option);
  };

  // Handle extra selection (multiple allowed)
  const handleExtraChange = (option) => {
    setSelectedExtra((prev) =>
      prev.includes(option)
        ? prev.filter((item) => item !== option)
        : [...prev, option]
    );

    if (option === 'ASSIST') setShowInfoField(!showInfoField);
  };

  // Add a function to format the display text
  const formatOptionDisplay = (option) => {
    const formatMap = {
      lcd: 'LCD',
      batt: 'BATT',
      lcdBatt: 'LCD + BATT',
      scocLcd: 'SCOCCA + LCD',
      scocBatt: 'SCOCCA + BATT',
      scocca: 'SCOCCA',
      scBattLcd: 'SCOCCA + LCD + BATT',
      fId: 'FACE ID',
      cam: 'CAM',
      washing: 'WASHING',
      ASSIST: 'ASSIST',
    };
    return formatMap[option] || option;
  };

  // Add loading state
  const [isSaving, setIsSaving] = useState(false);

  const handleSubmit = async () => {
    try {
      setIsSaving(true); // Start loading
      let ordinary = {};
      let extra = {};
      let extraTechnician = {};
      let ordinaryTechnician = {};
      const user = JSON.parse(localStorage.getItem('user'));

      // console.log(user.user)

      // Extract ordinary key-value for materialCost and technicianCost
      if (selectedOrdinary && materialCost[selectedOrdinary]) {
        ordinary = { [selectedOrdinary]: materialCost[selectedOrdinary] };
      }
      if (selectedOrdinary && technicianCost[selectedOrdinary]) {
        ordinaryTechnician = {
          [selectedOrdinary]: technicianCost[selectedOrdinary],
        };
      }

      // Extract extra key-values for materialCost
      selectedExtra.forEach((item) => {
        if (materialCost[item]) {
          extra[item] = materialCost[item];
        }
      });

      // Extract extra key-values for technicianCost
      selectedExtra.forEach((item) => {
        if (technicianCost[item]) {
          extraTechnician[item] = technicianCost[item];
        }
      });

      // If "ASSIST" is selected, add its info inside extra
      if (selectedExtra.includes('ASSIST')) {
        extra['ASSIST'] = info || 'No additional info provided';
      }

      // Combine materialCost and technicianCost separately
      let MetrialCost = {
        ...ordinary,
        ...extra,
      };

      let TechnicianCost = {
        ...ordinaryTechnician, // Add technician cost for ordinary item
        ...extraTechnician,
      };

      // Final combined object
      let repairInfo = {
        repairComponents: MetrialCost,
        technicainCostByEachComp: TechnicianCost,
      };

      console.log('Final Data:', repairInfo);
      console.log('Final Imie:', selectedImei);

      const ObjtoSend = {
        isRepaired: true,
        repairInfo,
        name: user?.user.name,
        email: user?.user.email,
      };

      const res = await dispatch(
        updateRepairDetails({ imei: selectedImei, repairData: ObjtoSend })
      );

      if (res.meta.requestStatus == 'fulfilled') {
        toast.success('Devices Repaired Successfully');
        onClose();
        dispatch(clearRepairState());
        dispatch(fetchRepairProduct());
      } else {
        toast.error('Failed to Repair Device');
      }
      console.log(res);
    } catch (error) {
      toast.error('An error occurred');
      console.log('Error ', error);
      console.log(materialCost, technicianCost);
    } finally {
      setIsSaving(false); // End loading
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle className="bg-gray-800 text-white text-center font-bold p-3">
        Replaced Components - {selectedDevice?.deviceModel}
      </DialogTitle>
      <DialogContent className="p-6 bg-gray-900 text-white">
        <div className="flex justify-between">
          {/* ORDINARY Section */}
          <div className="w-1/2 p-3 bg-gray-800 rounded-md">
            <h3 className="text-lg font-bold text-white mb-3">ORDINARY</h3>
            {ordinaryOptions.map((option) => (
              <div key={option} className="flex items-center mb-2">
                <input
                  type="checkbox"
                  id={option}
                  checked={selectedOrdinary === option}
                  onChange={() => handleOrdinaryChange(option)}
                  className="hidden"
                />
                <label
                  htmlFor={option}
                  className={`cursor-pointer flex items-center w-full p-3 rounded-md text-white transition ${
                    selectedOrdinary === option
                      ? 'bg-blue-500'
                      : 'bg-gray-700 hover:bg-gray-600'
                  }`}
                >
                  <div
                    className={`w-5 h-5 border-2 rounded-md flex justify-center items-center ${
                      selectedOrdinary === option
                        ? 'border-blue-300 bg-blue-600'
                        : 'border-gray-400'
                    }`}
                  >
                    {selectedOrdinary === option && (
                      <div className="w-3 h-3 bg-white rounded-md"></div>
                    )}
                  </div>
                  <span className="ml-3">{formatOptionDisplay(option)}</span>
                </label>
              </div>
            ))}
          </div>

          {/* EXTRA Section */}
          <div className="w-1/2 p-3 bg-gray-800 rounded-md">
            <h3 className="text-lg font-bold text-white mb-3">EXTRA</h3>
            {extraOptions.map((option) => (
              <div key={option} className="flex items-center mb-2">
                <input
                  type="checkbox"
                  id={option}
                  checked={selectedExtra.includes(option)}
                  onChange={() => handleExtraChange(option)}
                  className="hidden"
                />
                <label
                  htmlFor={option}
                  className={`cursor-pointer flex items-center w-full p-3 rounded-md text-white transition ${
                    selectedExtra.includes(option)
                      ? 'bg-green-500'
                      : 'bg-gray-700 hover:bg-gray-600'
                  }`}
                >
                  <div
                    className={`w-5 h-5 border-2 rounded-md flex justify-center items-center ${
                      selectedExtra.includes(option)
                        ? 'border-green-300 bg-green-600'
                        : 'border-gray-400'
                    }`}
                  >
                    {selectedExtra.includes(option) && (
                      <div className="w-3 h-3 bg-white rounded-md"></div>
                    )}
                  </div>
                  <span className="ml-3">{formatOptionDisplay(option)}</span>
                </label>
              </div>
            ))}

            {/* INFO Field Appears Only If "ASSIST." is Selected */}
            {showInfoField && (
              <div className="mt-4">
                <label className="font-bold text-white">INFO:</label>
                <input
                  type="text"
                  value={info}
                  onChange={(e) => setInfo(e.target.value)}
                  className="border p-2 w-full bg-gray-700 text-white rounded-md"
                  placeholder="Enter details for ASSIST."
                />
              </div>
            )}
          </div>
        </div>
      </DialogContent>

      <DialogActions className="bg-gray-800 p-3">
        <Button
          variant="contained"
          color="secondary"
          onClick={onClose}
          disabled={isSaving}
        >
          Close
        </Button>
        <Button
          variant="contained"
          color="primary"
          onClick={handleSubmit}
          disabled={isSaving}
        >
          {isSaving ? (
            <div className="flex items-center">
              <svg className="animate-spin h-5 w-5 mr-2" viewBox="0 0 24 24">
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                />
              </svg>
              Saving...
            </div>
          ) : (
            'Save'
          )}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default DeviceModal;
