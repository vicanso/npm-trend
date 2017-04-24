import debug from 'debug';

import * as globals from './globals';

export default debug(globals.get('CONFIG.app'));
