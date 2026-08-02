# Worktrace recruiter proof

Public-safe proof package for the private `fbratten/worktrace` source repository.

## Source pins

- source repository: `fbratten/worktrace` (private)
- current source/documentation pin: `e09c10acfd7b3748054bb4b31beb6594d57136e2`
- implementation and verification receipt: `84e03b312e36c66e4fdcac05a3ff800961c6fea5`
- verified: 2026-08-02

## Supported claims

- Worktrace is a local-first Python CLI and SQLite action-evidence ledger.
- Runtime dependencies are stdlib-only except `tzdata` on native Windows.
- The canonical event contract is envelope version 2; the current ledger schema is 6 and producer version is 0.4.2.
- It distinguishes source-exact, collection-time, source-interval and order-only temporal evidence.
- It stores bounded metadata rather than file contents, prompts, transcripts, raw terminal output, cookies or credentials.
- The implementation receipt records 962 passing tests, 0 skipped, with CI across Python 3.10–3.13.
- Automatic Claude Code observation, a durable Personal RAG outbox and operator-facing `rag status` / `rag drain` recovery are implemented in v0.4.2.

## Verification boundary

The test and CI receipts come from source history and were not re-run by this static publication change. The public page uses browser memory only; it does not run the Python CLI or SQLite ledger.

## Public-data policy

All events, paths, commands, projects, machines and session references shown by the page are fictional. The page does not include:

- a real ledger or exported event;
- real shell history or terminal output;
- real Claude Code session references or transcripts;
- private project paths, URLs or repository activity;
- Personal RAG records or embedding-provider calls;
- credentials, cookies, environment dumps or secrets.

## Non-claims

- Recording `invoked` or `referenced` does not prove a command succeeded or produced its intended effect.
- No daemon, scheduler, screen recorder, keylogger, clipboard logger or browser-history collector is claimed.
- Native Windows execution is not claimed as verified; the source states verification ran on WSL/Linux.
- No open-source or public-source status is implied for the private source repository, which currently has no selected licence.
