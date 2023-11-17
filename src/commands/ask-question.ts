import createDebug from 'debug';
import { program } from 'commander';
import { Ollama } from 'langchain/llms/ollama';
import { OllamaEmbeddings } from 'langchain/embeddings/ollama';
import { FaissStore } from 'langchain/vectorstores/faiss';
import {
  ChatPromptTemplate,
  HumanMessagePromptTemplate,
  SystemMessagePromptTemplate,
} from 'langchain/prompts';
import { RunnablePassthrough, RunnableSequence } from 'langchain/schema/runnable';
import { StringOutputParser } from 'langchain/schema/output_parser';
import { formatDocumentsAsString } from 'langchain/util/document';

type Options = {
  input: string;
};

const debug = createDebug('command');
const embeddings = new OllamaEmbeddings({
  baseUrl: 'http://localhost:11434',
  model: 'llama2',
});

const model = new Ollama({
  baseUrl: 'http://localhost:11434',
  model: 'llama2',
  temperature: 0.1,
});

const QA_PROMPT_TEMPLATE = `
  Use the following pieces of context, given between two character sets ">>>" and "<<<", to answer the question about the commit messages.
  Each commit message is in format of: A commit was made by "author name" with email "author email", on date "commit date", with a message "commit message".
  ----------------
  CONTEXT: >>> {context} <<<
  ANSWER: (formatted nicely in text):
`;

const askQuestion = async ({ input }: Readonly<Options>) => {
  const vectorStore = await FaissStore.load('.storage', embeddings);

  debug('Storage loaded');

  const messages = [
    SystemMessagePromptTemplate.fromTemplate(QA_PROMPT_TEMPLATE),
    HumanMessagePromptTemplate.fromTemplate('{question}'),
  ];

  const prompt = ChatPromptTemplate.fromMessages(messages);
  const chain = RunnableSequence.from([
    {
      context: vectorStore.asRetriever().pipe(formatDocumentsAsString),
      question: new RunnablePassthrough(),
    },
    prompt,
    model,
    new StringOutputParser(),
  ]);

  debug('Executing query');

  const answer = await chain.invoke(input);
  console.log(`answer>\t${String(answer).trim()}`);
};

program
  .command('ask-question')
  .description('chat with git history')
  .requiredOption('-i, --input [input message]', 'query to execute against llm')
  .action(askQuestion);
