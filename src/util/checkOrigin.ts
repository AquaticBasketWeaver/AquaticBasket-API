import { bool } from 'aws-sdk/clients/signer';
import constants from '../constants/constants.json';

const checkOrigin = (origin: string): bool => {
    return constants['allowed-origins'].includes(origin);
};

export default checkOrigin;
