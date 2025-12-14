const { VertexAI } = require('@google-cloud/vertexai');

async function checkModel() {
    const project = 'omi-ai-474603';
    const location = 'us-central1';

    console.log(`Checking model in project ${project}, location ${location}...`);

    try {
        const vertexAI = new VertexAI({ project, location });
        const model = vertexAI.getGenerativeModel({
            model: 'gemini-1.5-flash-001',
        });

        const resp = await model.generateContent('Hello');
        console.log('Model response:', resp.response.candidates[0].content.parts[0].text);
        console.log('SUCCESS: Model found and working.');
    } catch (error) {
        console.error('ERROR:', error.message);
        if (error.cause) {
            console.error('Cause:', error.cause);
        }
    }
}

checkModel();
