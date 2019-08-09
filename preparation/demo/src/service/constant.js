import {gasFaucetPeerId, gasBurnPeerId, totalCreditToken, thresholdForVrfRa} from '../poc/constValue';

export default {
  gasFaucetPeerId,
  gasBurnPeerId,
  MAX_CREDIT_SCORE: totalCreditToken,
  EACH_CREDIT_SCORE_FOR_VRF: thresholdForVrfRa,
  task_status : {
    'ELECT' : 'elect',
    'PROCESSING' : 'processing',
    'COMPLETED' : 'completed'
  },
  task_type : {
    'REMOTE_ATTESTATION' : 'remote_attestation',
    'CACULATE' : 'caculate'
  },

  txlog_type : {
    'PUBLISH_CACULATE' : 'CaculateTaskDepositGas_ref_peer',
    'JOIN_CACULATE' : 'CaculateTaskDepositGas_join_ref_peer'
  },



  MAX_TASK_JOINER : 5
};