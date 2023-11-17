import { resolve } from 'path';
import { writeFileSync } from 'fs';
import { program } from 'commander';
import { simpleGit } from 'simple-git';
import createDebug from 'debug';

type Options = {
  output: string;
  repository: string;
};

type Result = {
  date: string;
  author_name: string;
  author_email: string;
  message: string;
};

const MAX_CONCURRENCY = +(process.env.MAX_CONCURRENCY ?? 10);
const debug = createDebug('command');

const exportHistory = async ({ output, repository }: Readonly<Options>) => {
  const results: Result[] = [];

  debug('Arguments', {
    output,
    repository,
    MAX_CONCURRENCY,
  });

  debug('Fetching git history');

  const git = simpleGit({
    maxConcurrentProcesses: MAX_CONCURRENCY,
    baseDir: resolve(repository),
    binary: 'git',
  });

  debug('Starting processing of commits');

  const history = await git.log();

  for (const commit of history.all) {
    const data = {
      date: commit.date,
      author_name: commit.author_name,
      author_email: commit.author_email,
      message: commit.message,
    };

    results.push(data);
  }

  const outputPath = resolve(output);
  const contents = JSON.stringify(results, null, 2);

  writeFileSync(outputPath, contents, 'utf-8');

  console.log(`History exported to ${outputPath}`);
};

program
  .command('export-history')
  .description('export history as json')
  .requiredOption('-o, --output [output file]', 'file path for exported history')
  .requiredOption('-r, --repository [repository path]', 'file path for working git repository')
  .action(exportHistory);
