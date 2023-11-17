import { program } from 'commander';

import './commands/ask-question.js';
import './commands/export-history.js';
import './commands/import-documents.js';

program
  .description('Git History Questions')
  .passThroughOptions()
  .enablePositionalOptions()
  .parse(process.argv);
