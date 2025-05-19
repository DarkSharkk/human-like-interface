const D_ID_API_KEY = import.meta.env.VITE_D_ID_API_KEY;
const D_ID_API_URL = 'https://api.d-id.com';

interface CreateTalkResponse {
    id: string;
    status: string;
    created_at: string;
}

interface GetTalkResponse {
    id: string;
    status: string;
    result_url?: string;
    error?: string;
}

export const didService = {
    async createClip(text: string): Promise<string> {
        console.log('Creating clip with text:', text);
        
        const response = await fetch(`${D_ID_API_URL}/talks`, {
            method: 'POST',
            headers: {
                'Authorization': `Basic ${D_ID_API_KEY}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                source_url: "https://d-id-public-bucket.s3.us-west-2.amazonaws.com/alice.jpg",
                script: {
                    type: "text",
                    input: text,
                    provider: {
                        type: "microsoft",
                        voice_id: "Svetlana",
                        language: 'Russian (Russia)',
                        voice_config: {
                            style: "Cheerful"
                        }
                    }
                },
                config: {
                    fluent: false
                },
                driver_url: 'bank://natural',
            })
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(`Failed to create clip: ${error.message || response.statusText}`);
        }

        const data: CreateTalkResponse = await response.json();
        console.log('Clip created:', data);
        return data.id;
    },

    async getClip(clipId: string): Promise<string> {
        console.log('Getting clip:', clipId);
        
        const response = await fetch(`${D_ID_API_URL}/talks/${clipId}`, {
            method: 'GET',
            headers: {
                'Authorization': `Basic ${D_ID_API_KEY}`
            }
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(`Failed to get clip: ${error.message || response.statusText}`);
        }

        const data: GetTalkResponse = await response.json();
        console.log('Clip status:', data);

        if (data.status === 'error') {
            throw new Error(data.error || 'Unknown error occurred');
        }

        if (!data.result_url) {
            throw new Error('No result URL in response');
        }

        return data.result_url;
    },

    async waitForClip(clipId: string, maxAttempts = 30): Promise<string> {
        console.log('Waiting for clip:', clipId);
        
        for (let attempt = 0; attempt < maxAttempts; attempt++) {
            const response = await fetch(`${D_ID_API_URL}/talks/${clipId}`, {
                method: 'GET',
                headers: {
                    'Authorization': `Basic ${D_ID_API_KEY}`
                }
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(`Failed to check clip status: ${error.message || response.statusText}`);
            }

            const data: GetTalkResponse = await response.json();
            console.log(`Attempt ${attempt + 1}: Clip status:`, data.status);

            if (data.status === 'done' && data.result_url) {
                return data.result_url;
            }

            if (data.status === 'error') {
                throw new Error(data.error || 'Unknown error occurred');
            }

            // Ждем 2 секунды перед следующей попыткой
            await new Promise(resolve => setTimeout(resolve, 2000));
        }

        throw new Error('Timeout waiting for clip to be ready');
    }
}; 