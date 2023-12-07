import { getProdVersion } from './utils.js';

const version = process.env.PUBLISH_VERSION;

if (version?.includes('-prod-')) {
  process.stdout.write(getProdVersion(version));
}
