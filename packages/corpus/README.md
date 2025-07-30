# Legal Corpus

This package contains the Zambian legal documents that will be ingested into the Vertex AI Vector Search index.

## Structure

- `acts/` - Zambian Acts of Parliament
- `constitution/` - Constitution of Zambia
- `regulations/` - Statutory Instruments and Regulations
- `case-law/` - Important court decisions and precedents

## Format

Documents should be in plain text format (.txt) with clear section markers and citations.

## Ingestion

The documents in this package will be processed by the seeding scripts in `packages/seeding` and ingested into Vertex AI Vector Search for the RAG engine. 