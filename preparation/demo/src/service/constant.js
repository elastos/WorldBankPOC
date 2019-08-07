import {gasFaucetPeerId, gasBurnPeerId} from '../poc/constValue';

export default {
  gasFaucetPeerId,
  gasBurnPeerId,
  task_status : {
    'ELECT' : 'elect',
    'PROCESSING' : 'processing',
    'COMPLETED' : 'completed'
  },
  task_type : {
    'REMOTE_ATTESTATION' : 'remote_attestation',
    'CACULATE' : 'caculate'
  },

  TXLOG_TYPE : {
    'CACULATE' : 'CaculateTaskDepositGas_ref_peer',
  }
};