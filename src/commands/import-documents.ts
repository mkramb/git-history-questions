import { readFileSync } from 'fs';
import { resolve } from 'path';
import { program } from 'commander';
import createDebug from 'debug';
import { FaissStore } from 'langchain/vectorstores/faiss';
import { OllamaEmbeddings } from 'langchain/embeddings/ollama';
import { CharacterTextSplitter } from 'langchain/text_splitter';
import { CacheBackedEmbeddings } from 'langchain/embeddings/cache_backed';
import { InMemoryStore } from 'langchain/storage/in_memory';

type Options = {
  input: string;
};

const debug = createDebug('command');
const embeddings = new OllamaEmbeddings({
  baseUrl: 'http://localhost:11434',
  model: 'llama2',
});
const inMemoryStore = new InMemoryStore();
const cacheBackedEmbeddings = CacheBackedEmbeddings.fromBytesStore(embeddings, inMemoryStore);

const importDocuments = async ({ input }: Readonly<Options>) => {
  debug('Arguments', {
    input,
  });

  debug('Loading JSON documents');

  const historyPath = resolve(input);
  const historyCommits = JSON.parse(readFileSync(historyPath, 'utf-8'));

  let text = '';

  for (const commit of historyCommits) {
    text += `
      A commit was made by ${commit.author_name} with email ${commit.author_email}, on date ${commit.date}, with a message "${commit.message}".
      <<< SEPARATOR >>>
    `;
  }

  debug('Executing text splitter');

  const textSplitter = new CharacterTextSplitter({
    separator: '<<< SEPARATOR >>>',
    keepSeparator: false,
  });
  const documents = await textSplitter.createDocuments([text]);

  debug('Storing to vector storage');

  const vectorStore = await FaissStore.fromDocuments(documents, cacheBackedEmbeddings);
  await vectorStore.save('.storage');

  console.log('Stored history embeddings');
};

program
  .command('import-documents')
  .description('import git history to vector storage')
  .requiredOption('-i, --input [path to git history]', 'file path for git history')
  .action(importDocuments);
