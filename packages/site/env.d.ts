interface CloudflareEnv {
    VECTORIZE_INDEX: VectorizeIndex;
    AI: Fetcher;
    DB: D1Database;
    CONTACT_EMAIL: SendEmail;
    CF_SPACE: string;
    CF_KEY: string;
    AUTH0_BASE_URL: string;
    AUTH0_ISSUER_BASE_URL: string;
    AUTH0_CLIENT_ID: string;
    AUTH0_ADMIN_EMAIL: string;
    AUTH0_SECRET: string;
    AUTH0_CLIENT_SECRET: string;
    OPENAI_API_KEY: string;
    CLOUDFLARE_ZONE: string;
    CLOUDFLARE_API_KEY: string;
    NEXT_CACHE_DO_QUEUE: DurableObject;
    Images: Ima
}
