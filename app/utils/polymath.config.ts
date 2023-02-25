// TODO: don't just return some JSON, but have a wrapper using the JSON store that returns DEFAULTS etc

import polymathHostConfigJson from "~/config/host.SECRET.json";

const polymathHostConfig: PolymathHostConfig = polymathHostConfigJson as PolymathHostConfig;

type ServerOption = {
    url: string;
    name: string;
  }
  
type ServerOptions = ServerOption[];

interface PolymathHostConfig {
    default_private_access_tag?: string;
    default_api_key?: string;
    endpoint?: string;
    client_options?: {
        servers?: string[];
        pinecone?: {
            apiKey?: string;
            baseUrl?: string;
            namespace?: string;
            topK?: number;
        };
        omit?: string;
        debug?: boolean;
    };
    server_options?: ServerOptions,
    
    completions_options?: {
        model: string;
        prompt_template?: string;
        max_tokens?: number;
        temperature?: number;
        top_p?: number;
        n?: number;
        stream?: boolean;
        logprobs?: null;
        debug?: boolean;
    };
    info?: {
        headername?: string;
        placeholder?: string;
        fun_queries?: string[];
        source_prefixes?: {
            [key: string]: string;
        };
    };
    
}

export { polymathHostConfig };
export type { PolymathHostConfig };