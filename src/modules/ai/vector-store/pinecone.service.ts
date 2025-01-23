// src/modules/ai/vector-store/pinecone.service.ts
import { Service } from 'typedi';
import { Pinecone } from "@pinecone-database/pinecone";
import { Document } from "@langchain/core/documents";
import { OpenAIEmbeddings } from '@langchain/openai';
import { PineconeStore } from '@langchain/pinecone';

@Service()
class PineconeService {
    private client: Pinecone;
    private embeddings: OpenAIEmbeddings;
    private indexName: string;
    private namespace: string;

    constructor() {
        // Initialize Pinecone client
        this.client = new Pinecone({
            apiKey: process.env.PINECONE_API_KEY!,
        });

        // Initialize OpenAI embeddings
        this.embeddings = new OpenAIEmbeddings({
            openAIApiKey: process.env.OPENAI_API_KEY,
        });

        this.indexName = process.env.PINECONE_INDEX || 'ai-chat-index';
        this.namespace = 'chat-history';
    }

    private async getOrCreateIndex() {
        try {
            const indexes = await this.client.listIndexes();
            const indexExists = indexes.indexes?.some(index => index.name === this.indexName);
            
            if (!indexExists) {
                console.log(`Creating new Pinecone index: ${this.indexName}`);
                await this.client.createIndex({ 
                    name: this.indexName,
                    dimension: 1536, // OpenAI embeddings dimension
                    spec: {
                        serverless: {
                            cloud: 'aws' as const,
                            region: process.env.PINECONE_REGION || "us-west-2"
                        }
                    }
                });
                
                await new Promise(resolve => setTimeout(resolve, 1000));
            }

            return this.client.Index(this.indexName);
            
        } catch (error) {
            console.error('Error getting or creating Pinecone index:', error);
            throw error;
        }
    }

    async initVectorStore() {
        const index = await this.getOrCreateIndex();
        
        return await PineconeStore.fromExistingIndex(
            this.embeddings,
            {
                pineconeIndex: index,
                namespace: this.namespace,
                textKey: 'text',
            }
        );
    }

    async addDocument(text: string, metadata: Record<string, any> = {}) {
        try {
            const store = await this.initVectorStore();
            console.log('Adding document with metadata:', metadata);
            
            const document = new Document({
                pageContent: text,
                metadata
            });
    
            await store.addDocuments([document]);
            return document;
        } catch (error) {
            console.error('Error adding document:', error);
            throw error;
        }
    }

    async similaritySearch(
        query: string,
        k: number = 5,
        filterMetadata?: Record<string, any>
    ) {
        try {
            const store = await this.initVectorStore();
            console.log('Filter metadata:', filterMetadata);
            
            const results = await store.similaritySearch(query, k, filterMetadata);
            console.log('Search results:', results);
            
            return results;
        } catch (error) {
            console.error('Error in similaritySearch:', error);
            throw error;
        }
    }

    async deleteDocuments(ids: string[]) {
        try {
            const index = await this.getOrCreateIndex();
            await index.deleteMany(ids);
        } catch (error) {
            console.error('Error deleting documents:', error);
            throw error;
        }
    }

    async describeIndex() {
        try {
            const indexes = await this.client.listIndexes();
            const index = indexes.indexes?.find(idx => idx.name === this.indexName);
            return index || null;
        } catch (error) {
            console.error('Error describing index:', error);
            throw error;
        }
    }
}

export default PineconeService;