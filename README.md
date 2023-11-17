# git-history-questions

Lets have a conversation with our GIT history, using llama2 LLM and faiss for similarity search, all running locally.
- `export-history` - allow us to export history into JSON
- `import-documents` - stores rag embeddings into local vector store
- `ask-question` - performs similarity search across the dataset

Example question:

```
pnpm cli ask-question --input 'Has anyone used cursed words?'
```

> **answer>** Based on the commit messages provided, it appears that Mitja Kramberger has used a curse word in one of their commit messages. The message "PLT - use nack in dev" contains the word "nack", which could be interpreted as a mild curse word. However, it's important to note that the context of the commit message is related to software development and may not necessarily reflect the personal views or language usage of the individual who made the commit.


## Setup

Install pnpm:

```
corepack enable
corepack prepare pnpm@latest --activate
```

Compile commands:

```
pnpm run build
```

Serve LLM locally:

```
# install binary from ollama.ai
ollama pull llama2
ollama serve
```

## Usage

#### Export Git history and import as document to local vector storage

```
pnpm cli export-history --repository <local-path> controller --output ./history.json
pnpm cli import-documents --input ./history.json
```

#### Ask a question


```
pnpm cli ask-question --input 'Has anyone used cursed words?'
```
