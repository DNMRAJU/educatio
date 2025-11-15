import axios from 'axios';

// Configure the API endpoint - Backend Proxy
const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:5001';
const API_ENDPOINT = `${BACKEND_URL}/api/learn`;
const FREEPIK_API_KEY = process.env.REACT_APP_FREEPIK_API_KEY;
const FREEPIK_API_URL = 'https://api.freepik.com/v1/ai/text-to-image/seedream-v4';

export const sendLearningRequest = async (query) => {
  try {
    console.log('[Frontend] Sending request to backend:', query);
    console.log('[Frontend] Backend URL:', API_ENDPOINT);
    
    // Make POST request to backend proxy (which forwards to Airia)
    const response = await axios.post(API_ENDPOINT, {
      userInput: query
    }, {
      headers: {
        'Content-Type': 'application/json'
      }
    });

    console.log('[Frontend] Response received:', {
      status: response.status,
      hasData: !!response.data,
      dataKeys: response.data ? Object.keys(response.data) : [],
      requestId: response.data?.requestId,
      duration: response.data?.duration
    });

    // Return the response data
    return response;
  } catch (error) {
    console.error('[Frontend] API Error:', error.message);
    console.error('[Frontend] Error details:', {
      status: error.response?.status,
      data: error.response?.data,
      message: error.message
    });
    throw error;  // Throw error instead of using mock data
  }
};

// Additional API functions can be added here (currently not used)
export const getTopics = async () => {
  try {
    const response = await axios.get(`${API_ENDPOINT}/topics`);
    return response.data;
  } catch (error) {
    console.error('Error fetching topics:', error);
    return [];
  }
};

export const submitQuizAnswer = async (quizId, answers) => {
  try {
    const response = await axios.post(`${API_ENDPOINT}/quiz/submit`, {
      quizId,
      answers
    });
    return response.data;
  } catch (error) {
    console.error('Error submitting quiz:', error);
    throw error;
  }
};

// Generate image using Freepik API
export const generateFreepikImage = async (prompt, aspectRatio = 'widescreen_16_9') => {
  if (!FREEPIK_API_KEY) {
    console.warn('Freepik API key not configured');
    return null;
  }

  try {
    // Step 1: Submit image generation task
    const response = await axios.post(
      FREEPIK_API_URL,
      {
        prompt: prompt,
        num_images: 1,
        aspect_ratio: aspectRatio,
        person_generation: 'dont_allow',
        safety_settings: 'block_low_and_above'
      },
      {
        headers: {
          'x-freepik-api-key': FREEPIK_API_KEY,
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        timeout: 30000
      }
    );

    const taskId = response.data?.data?.task_id;
    if (!taskId) {
      throw new Error('No task_id received from Freepik');
    }

    console.log(`[Freepik] Task created: ${taskId}`);

    // Step 2: Poll for completion
    const maxAttempts = 60; // 2 minutes max (2 sec intervals)
    let attempts = 0;
    
    while (attempts < maxAttempts) {
      await new Promise(resolve => setTimeout(resolve, 2000)); // Wait 2 seconds
      
      const statusResponse = await axios.get(
        `${FREEPIK_API_URL}/${taskId}`,
        {
          headers: {
            'x-freepik-api-key': FREEPIK_API_KEY,
            'Accept': 'application/json'
          },
          timeout: 30000
        }
      );

      const status = statusResponse.data?.data?.status;
      console.log(`[Freepik] Poll attempt ${attempts + 1}: status=${status}`);

      if (status === 'COMPLETED') {
        const generated = statusResponse.data?.data?.generated || [];
        const imageUrl = generated.find(url => url?.startsWith('https://'));
        
        if (imageUrl) {
          console.log(`[Freepik] Image ready: ${imageUrl}`);
          return imageUrl;
        }
      } else if (status === 'FAILED' || status === 'ERROR' || status === 'CANCELED') {
        throw new Error(`Image generation failed with status: ${status}`);
      }

      attempts++;
    }

    throw new Error('Image generation timeout');
  } catch (error) {
    console.error('Freepik API Error:', error);
    return null; // Return null instead of throwing to allow graceful degradation
  }
};
