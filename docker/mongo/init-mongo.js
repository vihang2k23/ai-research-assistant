db = db.getSiblingDB("research");

db.createCollection("research_documents");

db.research_documents.createIndex({ createdAt: -1 });
db.research_documents.createIndex({ question: "text", report: "text" });

// For Atlas Vector Search in production, create a vector index on `embedding`:
// { "fields": [{ "type": "vector", "path": "embedding", "numDimensions": 1536, "similarity": "cosine" }] }
